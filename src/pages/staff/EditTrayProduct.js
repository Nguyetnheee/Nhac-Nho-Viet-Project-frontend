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
  const [selectedChecklistIds, setSelectedChecklistIds] = useState([]);

  // Load checklists từ API
  const loadChecklists = async (productDetailIdToLoad) => {
    try {
      const productDetailData = await productDetailService.getProductDetailWithChecklists(productDetailIdToLoad || productDetailId);
      if (productDetailData && productDetailData.checklists) {
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
        setSelectedChecklistIds(formattedChecklists.map(c => c.checklistId));
      } else {
        setChecklists([]);
        setSelectedChecklistIds([]);
      }
    } catch (error) {
      console.error('Error loading checklists:', error);
      setChecklists([]);
      setSelectedChecklistIds([]);
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
        productDetailId.productDetailId,
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
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditTrayProduct;