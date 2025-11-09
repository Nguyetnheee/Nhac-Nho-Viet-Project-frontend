// src/pages/admin/components/EditTrayProduct.js
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Space, Upload, message, Spin, Row, Col, Image, Typography, Alert, Table, Modal, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import regionService from '../../services/regionService';
import { checklistService } from '../../services/checklistService';
import { ritualService } from '../../services/ritualService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const EditTrayProduct = ({ productId, onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [productData, setProductData] = useState(null);
  
  // States for checklists management
  const [productDetailId, setProductDetailId] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [newChecklists, setNewChecklists] = useState([]); // Các dòng mới đang thêm
  const [availableItems, setAvailableItems] = useState([]);
  const [availableRituals, setAvailableRituals] = useState([]);
  const [availableChecklists, setAvailableChecklists] = useState([]); // Danh sách checklists có sẵn
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [isAssignChecklistModalVisible, setIsAssignChecklistModalVisible] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [checklistForm] = Form.useForm();
  const [assignChecklistForm] = Form.useForm();

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        // Load product, categories, regions, items, rituals, checklists
        const [productRes, categoriesRes, regionsRes, itemsRes, ritualsRes, checklistsRes] = await Promise.all([
          productService.getProductById(productId),
          categoryService.getAllCategories(),
          regionService.getAllRegions(),
          checklistService.getChecklistItems(),
          ritualService.getAllRituals(),
          checklistService.getAllChecklists()
        ]);
        
        setProductData(productRes);
        setCategories(categoriesRes || []);
        setRegions(regionsRes || []);
        setAvailableItems(itemsRes || []);
        setAvailableRituals(ritualsRes || []);
        setAvailableChecklists(checklistsRes || []);
        setCurrentImageUrl(productRes.productImage || '');
        form.setFieldsValue(productRes);
        
        // Load product detail với checklists
        try {
          const productDetailId = await productService.getProductDetailIdByProductId(productId);
          if (productDetailId) {
            setProductDetailId(productDetailId);
            const productDetailData = await productService.getProductDetailWithChecklists(productDetailId);
            if (productDetailData && productDetailData.checklists) {
              setChecklists(productDetailData.checklists || []);
            }
          }
        } catch (error) {
          console.warn('Could not load product detail checklists:', error);
          // Không báo lỗi nếu không có product detail
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu sản phẩm!');
      } finally {
        setInitialLoading(false);
      }
    };
    if (productId) loadInitialData();
  }, [productId, form]);

  const handleFileSelect = (file) => {
    // Validation logic is preserved from original file
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
    message.success('Đã chọn hình ảnh mới!');
    return false;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Bước 1: Cập nhật thông tin product
      const updateData = { ...values, price: Number(values.price), categoryId: Number(values.categoryId), regionId: Number(values.regionId) };
      const productResponse = await productService.updateProduct(productId, updateData, selectedFile);
      
      // Bước 2: Cập nhật product detail với checklists nếu có productDetailId
      if (productDetailId && productData) {
        try {
          const selectedCategory = categories.find(c => c.categoryId === Number(values.categoryId));
          const selectedRegion = regions.find(r => r.regionId === Number(values.regionId));
          
          // Merge checklists cũ và mới, chỉ lấy những dòng đã chọn checklist
          const allChecklists = [
            ...checklists,
            ...newChecklists.filter(cl => cl.checklistId && cl.itemId)
          ];
          
          // Chuẩn bị data cho product detail update
          const productDetailUpdateData = {
            productDetailId: productDetailId,
            product: {
              productId: productId,
              category: selectedCategory ? {
                categoryId: selectedCategory.categoryId,
                categoryName: selectedCategory.categoryName || '',
                description: selectedCategory.description || ''
              } : {
                categoryId: Number(values.categoryId),
                categoryName: '',
                description: ''
              },
              region: selectedRegion ? {
                regionId: selectedRegion.regionId,
                regionName: selectedRegion.regionName || '',
                regionDescription: selectedRegion.regionDescription || ''
              } : {
                regionId: Number(values.regionId),
                regionName: '',
                regionDescription: ''
              },
              productName: values.productName,
              price: Number(values.price),
              productDescription: values.productDescription || '',
              productImage: productResponse?.productImage || productResponse?.data?.productImage || currentImageUrl,
              status: values.productStatus || 'AVAILABLE',
              productDetails: []
            },
            checklists: allChecklists.map(cl => {
              // Tìm ritual và item từ available lists nếu chưa có đầy đủ
              const ritualData = cl.ritual || (cl.ritualId ? availableRituals.find(r => r.ritualId === cl.ritualId) : null);
              const itemData = cl.item || (cl.itemId ? availableItems.find(i => i.itemId === cl.itemId) : null);
              
              return {
                checklistId: cl.checklistId || 0,
                ritual: ritualData ? {
                  ritualId: ritualData.ritualId || cl.ritualId || 0,
                  ritualName: ritualData.ritualName || cl.ritualName || '',
                  dateLunar: ritualData.dateLunar || '',
                  region: ritualData.region || {},
                  dateSolar: ritualData.dateSolar || '',
                  description: ritualData.description || '',
                  meaning: ritualData.meaning || '',
                  imageUrl: ritualData.imageUrl || '',
                  checklists: []
                } : {
                  ritualId: cl.ritualId || 0,
                  ritualName: cl.ritualName || '',
                  dateLunar: '',
                  region: {},
                  dateSolar: '',
                  description: '',
                  meaning: '',
                  imageUrl: '',
                  checklists: []
                },
                item: itemData ? {
                  itemId: itemData.itemId || cl.itemId || 0,
                  itemName: itemData.itemName || cl.itemName || '',
                  unit: itemData.unit || cl.unit || '',
                  stockQuantity: itemData.stockQuantity || 0,
                  isActive: itemData.isActive !== false,
                  deletedAt: null
                } : {
                  itemId: cl.itemId || 0,
                  itemName: cl.itemName || '',
                  unit: cl.unit || '',
                  stockQuantity: 0,
                  isActive: true,
                  deletedAt: null
                },
                productDetail: '',
                quantity: cl.quantity || 0,
                checkNote: cl.checkNote || '',
                status: cl.status || 'PENDING'
              };
            })
          };
          
          await productService.updateProductDetail(productDetailId, productDetailUpdateData);
          
          // Clear các dòng mới sau khi lưu thành công
          setNewChecklists([]);
          
          // Reload checklists từ server để có dữ liệu mới nhất
          try {
            const productDetailData = await productService.getProductDetailWithChecklists(productDetailId);
            if (productDetailData && productDetailData.checklists) {
              setChecklists(productDetailData.checklists || []);
            }
          } catch (error) {
            console.error('Error reloading checklists:', error);
          }
        } catch (error) {
          console.error('Error updating product detail:', error);
          // Không fail toàn bộ nếu chỉ lỗi update checklists
          message.warning('Đã cập nhật sản phẩm nhưng có lỗi khi cập nhật nguyên liệu!');
        }
      }
      
      message.success('Cập nhật mâm cúng thành công!');
      if (onSuccess) onSuccess(productResponse);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật mâm cúng thất bại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Checklist management functions
  const handleAddChecklist = () => {
    // Nếu chưa có checklists và chưa có productDetailId, mở modal assign checklists
    if (checklists.length === 0 && newChecklists.length === 0 && productDetailId) {
      setIsAssignChecklistModalVisible(true);
      assignChecklistForm.resetFields();
    } else {
      // Thêm dòng mới vào bảng để staff có thể nhập trực tiếp
      const newRow = {
        tempId: `temp-${Date.now()}-${Math.random()}`, // ID tạm để track
        checklistId: 0,
        ritualId: null,
        ritualName: '',
        itemId: null,
        itemName: '',
        quantity: 1,
        unit: '',
        checkNote: '',
        status: 'PENDING',
        isNew: true // Đánh dấu là dòng mới
      };
      setNewChecklists(prev => [...prev, newRow]);
    }
  };
  
  // Cập nhật dòng mới trong bảng
  const handleUpdateNewChecklist = (tempId, field, value) => {
    setNewChecklists(prev => prev.map(row => {
      if (row.tempId === tempId) {
        const updated = { ...row, [field]: value };
        
        // Nếu chọn checklist, tự động điền thông tin
        if (field === 'checklistId' && value) {
          const selectedChecklist = availableChecklists.find(c => c.checklistId === value);
          if (selectedChecklist) {
            updated.ritualId = selectedChecklist.ritualId || selectedChecklist.ritual?.ritualId;
            updated.ritualName = selectedChecklist.ritualName || selectedChecklist.ritual?.ritualName || '';
            updated.itemId = selectedChecklist.itemId || selectedChecklist.item?.itemId;
            updated.itemName = selectedChecklist.itemName || selectedChecklist.item?.itemName || '';
            updated.unit = selectedChecklist.unit || selectedChecklist.item?.unit || '';
          }
        }
        
        return updated;
      }
      return row;
    }));
  };
  
  // Xóa dòng mới
  const handleDeleteNewChecklist = (tempId) => {
    setNewChecklists(prev => prev.filter(row => row.tempId !== tempId));
  };
  
  // Handle assign checklists (khi chưa có checklists)
  const handleAssignChecklists = async () => {
    try {
      const values = await assignChecklistForm.validateFields();
      
      if (!productDetailId) {
        message.error('Không tìm thấy product detail ID!');
        return;
      }
      
      // Gửi request assign checklists
      await productService.assignChecklistsToProductDetail(
        productDetailId,
        values.checklistIds || []
      );
      
      message.success('Đã thêm nguyên liệu thành công!');
      setIsAssignChecklistModalVisible(false);
      assignChecklistForm.resetFields();
      
      // Reload checklists để hiển thị
      try {
        const productDetailData = await productService.getProductDetailWithChecklists(productDetailId);
        if (productDetailData && productDetailData.checklists) {
          setChecklists(productDetailData.checklists || []);
        }
      } catch (error) {
        console.error('Error reloading checklists:', error);
      }
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      console.error('Error assigning checklists:', error);
      const errorMessage = error.response?.data?.message || 'Không thể thêm nguyên liệu!';
      message.error(errorMessage);
    }
  };
  
  const handleEditChecklist = (checklist) => {
    setEditingChecklist(checklist);
    checklistForm.setFieldsValue({
      ritualId: checklist.ritualId || checklist.ritual?.ritualId,
      itemId: checklist.itemId || checklist.item?.itemId,
      quantity: checklist.quantity,
      checkNote: checklist.checkNote || ''
    });
    setIsChecklistModalVisible(true);
  };
  
  const handleDeleteChecklist = (checklist) => {
    setChecklists(prev => prev.filter(cl => 
      cl.checklistId !== checklist.checklistId || 
      (cl.ritualId !== checklist.ritualId && cl.itemId !== checklist.itemId)
    ));
    message.success('Đã xóa nguyên liệu khỏi danh sách!');
  };
  
  const handleSaveChecklist = () => {
    checklistForm.validateFields().then(values => {
      const selectedItem = availableItems.find(i => i.itemId === values.itemId);
      const selectedRitual = availableRituals.find(r => r.ritualId === values.ritualId);
      
      const newChecklist = {
        checklistId: editingChecklist?.checklistId || 0,
        ritualId: values.ritualId,
        ritualName: selectedRitual?.ritualName || '',
        ritual: selectedRitual ? {
          ritualId: selectedRitual.ritualId,
          ritualName: selectedRitual.ritualName,
          dateLunar: selectedRitual.dateLunar || '',
          region: selectedRitual.region || {},
          dateSolar: selectedRitual.dateSolar || '',
          description: selectedRitual.description || '',
          meaning: selectedRitual.meaning || '',
          imageUrl: selectedRitual.imageUrl || '',
          checklists: []
        } : null,
        itemId: values.itemId,
        itemName: selectedItem?.itemName || '',
        item: selectedItem ? {
          itemId: selectedItem.itemId,
          itemName: selectedItem.itemName,
          unit: selectedItem.unit || '',
          stockQuantity: selectedItem.stockQuantity || 0,
          isActive: selectedItem.isActive !== false,
          deletedAt: null
        } : null,
        quantity: Number(values.quantity),
        unit: selectedItem?.unit || '',
        checkNote: values.checkNote || '',
        status: 'PENDING' // Set mặc định, không cho staff chọn
      };
      
      if (editingChecklist) {
        // Update existing
        setChecklists(prev => prev.map(cl => 
          (cl.checklistId === editingChecklist.checklistId && 
           cl.ritualId === editingChecklist.ritualId && 
           cl.itemId === editingChecklist.itemId) ? newChecklist : cl
        ));
        message.success('Đã cập nhật nguyên liệu!');
      } else {
        // Add new
        setChecklists(prev => [...prev, newChecklist]);
        message.success('Đã thêm nguyên liệu!');
      }
      
      setIsChecklistModalVisible(false);
      checklistForm.resetFields();
      setEditingChecklist(null);
    });
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải dữ liệu sản phẩm..." />
      </div>
    );
  }

  if (!productData) {
    return <Alert message="Lỗi" description="Không tìm thấy sản phẩm." type="error" showIcon action={<Button onClick={onBack}>Quay lại</Button>} />;
  }

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className="font-sans">
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>
                {/* <EditOutlined />  */}
                Chỉnh sửa mâm cúng</Space>
            </Title>
            <Text type="secondary">Cập nhật thông tin cho sản phẩm: <span className="font-semibold">{productData.productName}</span></Text>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại danh sách</Button>
        </div>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4} className="font-serif !text-vietnam-green">Thông tin sản phẩm</Title>
              <Form.Item name="productName" label="Tên mâm cúng" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                    <InputNumber className="w-full" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\$\s?|(,*)/g, '')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="productStatus" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                    <Select>
                      <Option value="AVAILABLE">Có sẵn</Option>
                      <Option value="UNAVAILABLE">Hết hàng</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                    <Select placeholder="Chọn danh mục" loading={categories.length === 0}>
                      {categories.map(c => <Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="regionId" label="Vùng miền" rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}>
                    <Select placeholder="Chọn vùng miền" loading={regions.length === 0}>
                      {regions.map(r => <Option key={r.regionId} value={r.regionId}>{r.regionName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="productDescription" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                <TextArea rows={5} showCount maxLength={1000} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit"
                    // icon={<SaveOutlined />}
                    loading={loading} className="bg-vietnam-green hover:!bg-emerald-800">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </Button>
                  <Button onClick={onBack}>Hủy</Button>
                </Space>
              </Form.Item>
            </Card>

            {/* Bảng quản lý nguyên liệu */}
            <Card className="shadow-lg rounded-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="font-serif !text-vietnam-green !mb-0">
                  Quản lý nguyên liệu trong kho
                </Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddChecklist}
                  className="bg-vietnam-gold hover:!bg-yellow-500"
                >
                  Thêm nguyên liệu
                </Button>
              </div>
              
              {(checklists.length > 0 || newChecklists.length > 0) ? (
                <Table
                  dataSource={[...checklists, ...newChecklists]}
                  rowKey={(record) => record.tempId || `${record.checklistId || 0}-${record.ritualId || 0}-${record.itemId || 0}`}
                  pagination={false}
                  size="small"
                  bordered
                  columns={[
                    {
                      title: 'STT',
                      key: 'index',
                      width: 60,
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: 'Tên nguyên liệu',
                      key: 'itemName',
                      width: 200,
                      render: (_, record) => {
                        if (record.isNew) {
                          // Dòng mới: dropdown chọn checklist
                          return (
                            <Select
                              placeholder="Chọn nguyên liệu"
                              style={{ width: '100%' }}
                              showSearch
                              value={record.checklistId || undefined}
                              onChange={(value) => handleUpdateNewChecklist(record.tempId, 'checklistId', value)}
                              filterOption={(input, option) => {
                                const checklist = availableChecklists.find(c => c.checklistId === option.value);
                                if (!checklist) return false;
                                const itemName = checklist.item?.itemName || checklist.itemName || '';
                                const searchText = itemName.toLowerCase();
                                return searchText.includes(input.toLowerCase());
                              }}
                            >
                              {availableChecklists.map(checklist => {
                                const itemName = checklist.item?.itemName || checklist.itemName || 'N/A';
                                return (
                                  <Option key={checklist.checklistId} value={checklist.checklistId}>
                                    {itemName}
                                  </Option>
                                );
                              })}
                            </Select>
                          );
                        }
                        return <Text strong>{record.itemName || 'N/A'}</Text>;
                      },
                    },
                    {
                      title: 'Số lượng',
                      key: 'quantity',
                      width: 120,
                      align: 'center',
                      render: (_, record) => {
                        if (record.isNew) {
                          // Dòng mới: input số lượng
                          return (
                            <InputNumber
                              min={1}
                              value={record.quantity || 1}
                              onChange={(value) => handleUpdateNewChecklist(record.tempId, 'quantity', value || 1)}
                              style={{ width: '100%' }}
                            />
                          );
                        }
                        return (
                          <Text>{record.quantity !== null && record.quantity !== undefined ? record.quantity : 'N/A'}</Text>
                        );
                      },
                    },
                    {
                      title: 'Đơn vị',
                      key: 'unit',
                      width: 100,
                      align: 'center',
                      render: (_, record) => <Tag>{record.unit || '-'}</Tag>,
                    },
                    {
                      title: 'Ghi chú',
                      key: 'checkNote',
                      width: 200,
                      render: (_, record) => {
                        if (record.isNew) {
                          // Dòng mới: textarea ghi chú
                          return (
                            <Input.TextArea
                              rows={2}
                              value={record.checkNote || ''}
                              onChange={(e) => handleUpdateNewChecklist(record.tempId, 'checkNote', e.target.value)}
                              placeholder="Ghi chú (tùy chọn)"
                              maxLength={200}
                            />
                          );
                        }
                        return (
                          <Text type="secondary" style={{ fontStyle: 'italic' }}>
                            {record.checkNote || '-'}
                          </Text>
                        );
                      },
                    },
                    {
                      title: 'Hành động',
                      key: 'action',
                      width: 120,
                      render: (_, record) => {
                        if (record.isNew) {
                          // Dòng mới: chỉ có nút xóa
                          return (
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteNewChecklist(record.tempId)}
                            >
                              Xóa
                            </Button>
                          );
                        }
                        // Dòng cũ: có nút sửa và xóa
                        return (
                          <Space>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditChecklist(record)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteChecklist(record)}
                            >
                              Xóa
                            </Button>
                          </Space>
                        );
                      },
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <Text type="secondary">Chưa có nguyên liệu nào. Nhấn "Thêm nguyên liệu" để bắt đầu.</Text>
                </div>
              )}
            </Card>

          </Col>
          <Col xs={24} lg={8}>
            <Card title="Hình ảnh mâm cúng" className="shadow-lg rounded-xl text-center">
              <Upload listType="picture-card" className="avatar-uploader" showUploadList={false} beforeUpload={handleFileSelect}>
                {displayImageUrl ? <img src={displayImageUrl} alt="preview" style={{ width: '100%' }} /> : (<div><PlusOutlined /><div className="mt-2">Chọn ảnh mới</div></div>)}
              </Upload>
              {previewUrl && (
                <Button size="small" className="mt-2" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}>Hủy ảnh mới</Button>
              )}
              <Text type="secondary" className="block mt-2 text-xs">
                {previewUrl ? `Đang sử dụng ảnh mới` : `Đang sử dụng ảnh hiện tại`}
              </Text>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Modal assign checklists (khi chưa có checklists) */}
      <Modal
        title="Thêm nguyên liệu cho mâm cúng"
        open={isAssignChecklistModalVisible}
        onOk={handleAssignChecklists}
        onCancel={() => {
          setIsAssignChecklistModalVisible(false);
          assignChecklistForm.resetFields();
        }}
        okText="Thêm"
        cancelText="Hủy"
        width={700}
      >
        <Form
          form={assignChecklistForm}
          layout="vertical"
        >
          <Form.Item
            name="checklistIds"
            label="Chọn nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nguyên liệu!' }]}
            tooltip="Chọn các nguyên liệu cần thêm vào mâm cúng này"
          >
            <Select
              mode="multiple"
              placeholder="Chọn nguyên liệu"
              showSearch
              filterOption={(input, option) => {
                const checklist = availableChecklists.find(c => c.checklistId === option.value);
                if (!checklist) return false;
                const itemName = checklist.item?.itemName || checklist.itemName || '';
                const searchText = itemName.toLowerCase();
                return searchText.includes(input.toLowerCase());
              }}
              optionLabelProp="label"
            >
              {availableChecklists.map(checklist => {
                const itemName = checklist.item?.itemName || checklist.itemName || 'N/A';
                
                return (
                  <Option key={checklist.checklistId} value={checklist.checklistId} label={itemName}>
                    <div>
                      <div><strong>{itemName}</strong></div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Lưu ý:</strong> Sau khi thêm, bạn có thể xem và chỉnh sửa số lượng, ghi chú của từng nguyên liệu trong bảng bên dưới.
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Modal thêm/sửa checklist (khi đã có checklists) */}
      <Modal
        title={editingChecklist ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
        open={isChecklistModalVisible}
        onOk={handleSaveChecklist}
        onCancel={() => {
          setIsChecklistModalVisible(false);
          checklistForm.resetFields();
          setEditingChecklist(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={checklistForm}
          layout="vertical"
        >
          <Form.Item
            name="ritualId"
            label="Lễ hội"
            rules={[{ required: true, message: 'Vui lòng chọn lễ hội!' }]}
          >
            <Select
              placeholder="Chọn lễ hội"
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableRituals.map(ritual => (
                <Option key={ritual.ritualId} value={ritual.ritualId}>
                  {ritual.ritualName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="itemId"
            label="Nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu!' }]}
          >
            <Select
              placeholder="Chọn nguyên liệu"
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableItems.map(item => (
                <Option key={item.itemId} value={item.itemId}>
                  {item.itemName} {item.unit ? `(${item.unit})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="checkNote"
            label="Ghi chú"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={3}
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditTrayProduct;