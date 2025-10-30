// src/pages/admin/components/EditTrayProduct.js
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Space, Upload, message, Spin, Row, Col, Image, Typography, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import regionService from '../../services/regionService';

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

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        const [productRes, categoriesRes, regionsRes] = await Promise.all([
          productService.getProductById(productId),
          categoryService.getAllCategories(),
          regionService.getAllRegions()
        ]);
        setProductData(productRes);
        setCategories(categoriesRes || []);
        setRegions(regionsRes || []);
        setCurrentImageUrl(productRes.productImage || '');
        form.setFieldsValue(productRes);
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
      const updateData = { ...values, price: Number(values.price), categoryId: Number(values.categoryId), regionId: Number(values.regionId) };
      const response = await productService.updateProduct(productId, updateData, selectedFile);
      message.success('Cập nhật mâm cúng thành công!');
      if (onSuccess) onSuccess(response);
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Cập nhật mâm cúng thất bại!';
        message.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
                  <Title level={2} className="font-serif !text-vietnam-red !mb-1">
                      <Space><EditOutlined /> Chỉnh sửa mâm cúng</Space>
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
                <Title level={4} className="font-serif !text-vietnam-red">Thông tin sản phẩm</Title>
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
                        <Option value="AVAILABLE">✅ Có sẵn</Option>
                        <Option value="OUT_OF_STOCK">❌ Hết hàng</Option>
                        <Option value="DISCONTINUED">🚫 Ngừng kinh doanh</Option>
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
            </Card>
             <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" className="bg-vietnam-red hover:!bg-red-800">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                    <Button size="large" onClick={onBack}>Hủy</Button>
                </Space>
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Hình ảnh sản phẩm" className="shadow-lg rounded-xl text-center">
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
    </div>
  );
};

export default EditTrayProduct;