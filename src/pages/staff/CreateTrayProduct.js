// src/pages/admin/components/CreateTrayProduct.js
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Space, Upload, message, Spin, Row, Col, Image, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, EyeOutlined, GiftOutlined } from '@ant-design/icons';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import regionService from '../../services/regionService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const CreateTrayProduct = ({ onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectDataLoading, setSelectDataLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    const loadSelectData = async () => {
      setSelectDataLoading(true);
      try {
        const [categoriesRes, regionsRes] = await Promise.all([
          categoryService.getAllCategories(),
          regionService.getAllRegions()
        ]);
        setCategories(categoriesRes || []);
        setRegions(regionsRes || []);
      } catch (error) {
        message.error('Không thể tải dữ liệu danh mục và vùng miền!');
      } finally {
        setSelectDataLoading(false);
      }
    };
    loadSelectData();
  }, []);

  const handleFileSelect = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const productData = { ...values, price: Number(values.price), categoryId: Number(values.categoryId), regionId: Number(values.regionId) };
      const response = await productService.createProduct(productData, selectedFile);
      message.success('Tạo mâm cúng mới thành công!');
      form.resetFields();
      setSelectedFile(null);
      setPreviewUrl('');
      if (onSuccess) onSuccess(response);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Tạo mâm cúng thất bại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
    </div>
  );
  
  return (
    <div className="font-sans">
        <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <Title level={2} className="font-serif !text-vietnam-green !mb-1">
                        <Space><GiftOutlined /> Thêm Mâm Cúng Mới</Space>
                    </Title>
                    <Text type="secondary">Tạo một sản phẩm mâm cúng mới để hiển thị trên trang bán hàng.</Text>
                </div>
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại danh sách</Button>
            </div>
        </Card>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ productStatus: 'AVAILABLE' }}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
                <Title level={4} className="font-serif !text-vietnam-green">Thông tin sản phẩm</Title>
                <Form.Item name="productName" label="Tên mâm cúng" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                    <Input placeholder="Ví dụ: Mâm cúng thôi nôi bé trai" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                    <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }, { type: 'number', min: 1000, message: 'Giá phải lớn hơn 1,000!' }]}>
                        <InputNumber className="w-full" placeholder="Ví dụ: 1500000" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
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
                
                <Spin spinning={selectDataLoading}>
                    <Row gutter={16}>
                        <Col span={12}>
                        <Form.Item name="categoryId" label="Loại mâm (Danh mục)" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                            <Select placeholder="Chọn loại mâm cúng">
                            {categories.map(cat => <Option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</Option>)}
                            </Select>
                        </Form.Item>
                        </Col>
                        <Col span={12}>
                        <Form.Item name="regionId" label="Vùng miền" rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}>
                            <Select placeholder="Chọn vùng miền">
                            {regions.map(reg => <Option key={reg.regionId} value={reg.regionId}>{reg.regionName}</Option>)}
                            </Select>
                        </Form.Item>
                        </Col>
                    </Row>
                </Spin>

                <Form.Item name="productDescription" label="Mô tả chi tiết" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                    <TextArea rows={5} placeholder="Mô tả các vật phẩm, ý nghĩa của mâm cúng..." showCount maxLength={1000} />
                </Form.Item>
            </Card>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" className="bg-vietnam-green hover:!bg-emerald-800">
                  {loading ? 'Đang tạo...' : 'Tạo mâm cúng'}
                </Button>
                <Button size="large" onClick={onBack}>Hủy</Button>
              </Space>
            </Form.Item>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Hình ảnh mâm cúng" className="shadow-lg rounded-xl text-center">
              <Upload name="file" listType="picture-card" className="avatar-uploader" showUploadList={false} beforeUpload={handleFileSelect}>
                {previewUrl ? <img src={previewUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
              </Upload>
              {previewUrl && 
                <Button size="small" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} className="mt-2">Xóa ảnh</Button>
              }
               <Text type="secondary" className="block mt-2 text-xs">Chọn ảnh JPG/PNG, nhỏ hơn 5MB.</Text>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateTrayProduct;