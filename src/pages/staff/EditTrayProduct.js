// src/pages/admin/components/EditTrayProduct.js
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Space, Upload, message, Spin, Row, Col, Image, Typography, Alert, Table, Modal, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import productService from '../../services/productService';
import productDetailService from '../../services/productDetailService';
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
  const [availableRituals, setAvailableRituals] = useState([]);
  const [groupedChecklists, setGroupedChecklists] = useState({}); // Checklists đã group theo ritual
  const [isAssignChecklistModalVisible, setIsAssignChecklistModalVisible] = useState(false);
  const [assignChecklistForm] = Form.useForm();
  const [selectedRitualId, setSelectedRitualId] = useState(null);

  // Load checklists từ API
  const loadChecklists = async (productDetailIdToLoad) => {
    try {
      const productDetailData = await productDetailService.getProductDetailWithChecklists(productDetailIdToLoad || productDetailId);
      if (productDetailData && productDetailData.checklists) {
        // Đảm bảo format đúng với API response
        const formattedChecklists = productDetailData.checklists.map(checklist => ({
          checklistId: checklist.checklistId,
          ritualId: checklist.ritualId,
          ritualName: checklist.ritualName,
          itemId: checklist.itemId,
          itemName: checklist.itemName,
          unit: checklist.unit,
          quantity: checklist.quantity,
          checkNote: checklist.checkNote
        }));
        setChecklists(formattedChecklists);
      } else {
        setChecklists([]);
      }
    } catch (error) {
      console.error('Error loading checklists:', error);
      setChecklists([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        // Load product, categories, regions, rituals, grouped checklists
        const [productRes, categoriesRes, regionsRes, ritualsRes, groupedChecklistsRes] = await Promise.all([
          productService.getProductById(productId),
          categoryService.getAllCategories(),
          regionService.getAllRegions(),
          ritualService.getAllRituals(),
          checklistService.getGroupedChecklists()
        ]);
        
        setProductData(productRes);
        setCategories(categoriesRes || []);
        setRegions(regionsRes || []);
        setAvailableRituals(ritualsRes || []);
        setGroupedChecklists(groupedChecklistsRes || {});
        setCurrentImageUrl(productRes.productImage || '');
        form.setFieldsValue(productRes);
        
        // Load product detail với checklists
        try {
          let productDetailId;
          try {
            productDetailId = await productDetailService.getProductDetailIdByProductId(productId);
          } catch (error) {
            // Nếu API trả về 500 hoặc không tìm thấy, có thể product detail chưa tồn tại
            // Tạo product detail mới
            console.warn('Product detail not found, creating new one...', error);
            try {
              const newProductDetail = await productDetailService.createProductDetail(productId);
              productDetailId = newProductDetail.productDetailId || newProductDetail.id;
              message.info('Đã tạo product detail mới cho sản phẩm này.');
            } catch (createError) {
              console.error('Error creating product detail:', createError);
              // Không báo lỗi, chỉ log - có thể product detail sẽ được tạo sau
            }
          }
          
          if (productDetailId) {
            setProductDetailId(productDetailId);
            await loadChecklists(productDetailId);
          }
        } catch (error) {
          console.warn('Could not load product detail checklists:', error);
          // Không báo lỗi nếu không có product detail - có thể chưa được tạo
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
      
      // Note: Checklists được gán riêng qua API assign-checklists, không cần update ở đây
      
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
  const handleOpenAssignChecklistModal = async () => {
    // Nếu chưa có productDetailId, thử tạo mới
    if (!productDetailId) {
      try {
        message.loading('Đang tạo product detail...', 0);
        const newProductDetail = await productService.createProductDetail(productId);
        const newProductDetailId = newProductDetail.productDetailId || newProductDetail.id;
        if (newProductDetailId) {
          setProductDetailId(newProductDetailId);
          message.destroy();
          message.success('Đã tạo product detail thành công!');
        } else {
          message.destroy();
          message.error('Không thể tạo product detail!');
          return;
        }
      } catch (error) {
        message.destroy();
        console.error('Error creating product detail:', error);
        message.error('Không thể tạo product detail. Vui lòng thử lại sau!');
        return;
      }
    }
    
    setIsAssignChecklistModalVisible(true);
    assignChecklistForm.resetFields();
    setSelectedRitualId(null);
  };
  
  // Handle assign checklists
  const handleAssignChecklists = async () => {
    try {
      const values = await assignChecklistForm.validateFields();
      
      if (!productDetailId) {
        message.error('Không tìm thấy product detail ID!');
        return;
      }
      
      if (!values.checklistIds || values.checklistIds.length === 0) {
        message.warning('Vui lòng chọn ít nhất một checklist!');
        return;
      }
      
      // Gửi request assign checklists
      await productDetailService.assignChecklistsToProductDetail(
        productDetailId,
        values.checklistIds
      );
      
      message.success('Đã gán danh mục sản phẩm thành công!');
      setIsAssignChecklistModalVisible(false);
      assignChecklistForm.resetFields();
      setSelectedRitualId(null);
      
      // Reload checklists từ API để hiển thị danh sách mới nhất
      await loadChecklists(productDetailId);
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      console.error('Error assigning checklists:', error);
      const errorMessage = error.response?.data?.message || 'Không thể gán checklist!';
      message.error(errorMessage);
    }
  };
  
  // Lấy danh sách checklist theo ritual đã chọn
  const getChecklistsByRitual = () => {
    if (!selectedRitualId || !groupedChecklists) {
      return [];
    }
    
    // Tìm ritual name từ ritualId
    const ritual = availableRituals.find(r => r.ritualId === selectedRitualId);
    if (!ritual || !ritual.ritualName) {
      return [];
    }
    
    // Lấy checklist items từ grouped checklists
    const ritualChecklists = groupedChecklists[ritual.ritualName];
    if (!ritualChecklists || !Array.isArray(ritualChecklists)) {
      return [];
    }
    
    return ritualChecklists;
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

            {/* Bảng gán danh mục checklist */}
            <Card className="shadow-lg rounded-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="font-serif !text-vietnam-green !mb-0">
                  Gán danh mục sản phẩm
                </Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleOpenAssignChecklistModal}
                  className="bg-vietnam-gold hover:!bg-yellow-500"
                >
                  Gán danh mục sản phẩm
                </Button>
              </div>
              
              <Alert
                message="Lưu ý"
                description="Chỉ có thể gán các dan đã được tạo sẵn trong phần 'Quản lý danh mục'. Để tạo danh mục mới, vui lòng vào phần 'Quản lý danh mục'."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              
              {checklists.length > 0 ? (
                <Table
                  dataSource={checklists}
                  rowKey={(record) => `${record.checklistId || 0}-${record.ritualId || 0}-${record.itemId || 0}`}
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
                      title: 'Lễ hội',
                      key: 'ritualName',
                      width: 200,
                      render: (_, record) => (
                        <Text strong>{record.ritualName || 'N/A'}</Text>
                      ),
                    },
                    {
                      title: 'Tên vật phẩm',
                      key: 'itemName',
                      width: 200,
                      render: (_, record) => (
                        <Text strong>{record.itemName || 'N/A'}</Text>
                      ),
                    },
                    {
                      title: 'Số lượng',
                      key: 'quantity',
                      width: 120,
                      align: 'center',
                      render: (_, record) => (
                        <Text>{record.quantity !== null && record.quantity !== undefined ? record.quantity : 'N/A'}</Text>
                      ),
                    },
                    {
                      title: 'Đơn vị',
                      key: 'unit',
                      width: 100,
                      align: 'center',
                      render: (_, record) => (
                        <Tag>{record.unit || '-'}</Tag>
                      ),
                    },
                    {
                      title: 'Ghi chú',
                      key: 'checkNote',
                      width: 200,
                      render: (_, record) => (
                        <Text type="secondary" style={{ fontStyle: 'italic' }}>
                          {record.checkNote || '-'}
                        </Text>
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <Text type="secondary">Chưa có checklist nào được gán. Nhấn "Gán checklist" để bắt đầu.</Text>
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

      {/* Modal assign checklists */}
      <Modal
        title="Gán danh mục checklist cho mâm cúng"
        open={isAssignChecklistModalVisible}
        onOk={handleAssignChecklists}
        onCancel={() => {
          setIsAssignChecklistModalVisible(false);
          assignChecklistForm.resetFields();
          setSelectedRitualId(null);
        }}
        okText="Gán checklist"
        cancelText="Hủy"
        width={700}
      >
        <Form
          form={assignChecklistForm}
          layout="vertical"
        >
          <Form.Item
            name="ritualId"
            label="Chọn lễ hội"
            rules={[{ required: true, message: 'Vui lòng chọn lễ hội!' }]}
            tooltip="Chọn lễ hội để xem danh sách checklist đã tạo sẵn"
          >
            <Select
              placeholder="Chọn lễ hội"
              showSearch
              value={selectedRitualId}
              onChange={(value) => {
                setSelectedRitualId(value);
                // Reset checklist selection khi đổi ritual
                assignChecklistForm.setFieldValue('checklistIds', []);
              }}
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
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
            name="checklistIds"
            label="Chọn checklist"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một checklist!' }]}
            tooltip="Chọn các checklist đã tạo sẵn cho lễ hội này"
          >
            <Select
              mode="multiple"
              placeholder={selectedRitualId ? "Chọn checklist" : "Vui lòng chọn lễ hội trước"}
              disabled={!selectedRitualId}
              showSearch
              filterOption={(input, option) => {
                const checklist = getChecklistsByRitual().find(c => c.checklistId === option.value);
                if (!checklist) return false;
                const itemName = checklist.itemName || checklist.item?.itemName || '';
                const searchText = itemName.toLowerCase();
                return searchText.includes(input.toLowerCase());
              }}
              optionLabelProp="label"
            >
              {getChecklistsByRitual().map(checklist => {
                const itemName = checklist.itemName || checklist.item?.itemName || 'N/A';
                const quantity = checklist.quantity || 0;
                const unit = checklist.unit || checklist.item?.unit || '';
                
                return (
                  <Option key={checklist.checklistId} value={checklist.checklistId} label={itemName}>
                    <div>
                      <div><strong>{itemName}</strong></div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Số lượng: {quantity} {unit}
                      </div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          
          {!selectedRitualId && (
            <Alert
              message="Vui lòng chọn lễ hội"
              description="Sau khi chọn lễ hội, danh sách checklist đã tạo sẵn cho lễ hội đó sẽ hiển thị."
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
          
          {selectedRitualId && getChecklistsByRitual().length === 0 && (
            <Alert
              message="Không có checklist nào"
              description={`Lễ hội này chưa có checklist nào được tạo. Vui lòng vào phần "Quản lý danh mục" để tạo checklist trước.`}
              type="warning"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
          
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Lưu ý:</strong> Chỉ có thể gán các checklist đã được tạo sẵn trong phần "Quản lý danh mục". 
              Khi khách hàng checkout thành công, hệ thống sẽ tự động trừ các vật phẩm tương ứng trong kho.
            </Text>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default EditTrayProduct;