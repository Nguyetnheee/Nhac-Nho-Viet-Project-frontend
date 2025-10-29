import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  Upload,
  message,
  Spin,
  Row,
  Col,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';

// Import services
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import regionService from '../../services/regionService';

const { TextArea } = Input;
const { Option } = Select;

const CreateTrayProduct = ({ onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Lưu file thực
  const [previewUrl, setPreviewUrl] = useState(''); // URL preview
  const [previewVisible, setPreviewVisible] = useState(false);

  // Load categories và regions khi component mount
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setLoading(true);
        
        // Load categories và regions song song
        const [categoriesRes, regionsRes] = await Promise.all([
          categoryService.getAllCategories(),
          regionService.getAllRegions()
        ]);

        setCategories(categoriesRes || []);
        setRegions(regionsRes || []);
        
      } catch (error) {
        message.error('Không thể tải dữ liệu danh mục và vùng miền!');
        console.error('Error loading select data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSelectData();
  }, []);

  // Xử lý chọn file (không upload ngay)
  const handleFileSelect = (file) => {
    console.log('File selected:', file);
    
    // Lưu file để gửi kèm form
    setSelectedFile(file);
    
    // Tạo URL preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    
    message.success('Đã chọn hình ảnh!');
    return false; // Prevent automatic upload
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu sản phẩm
      const productData = {
        productName: values.productName,
        price: Number(values.price),
        productDescription: values.productDescription,
        categoryId: Number(values.categoryId),
        regionId: Number(values.regionId),
        productStatus: values.productStatus || 'AVAILABLE'
      };

      console.log('=== SUBMITTING FORM ===');
      console.log('Product data:', productData);
      console.log('Selected file:', selectedFile);

      // Gọi API tạo sản phẩm với file
      const response = await productService.createProduct(productData, selectedFile);
      
      console.log('=== API RESPONSE ===', response);

      if (response) {
        message.success('Tạo mâm cúng mới thành công!');
        
        // Reset form và state
        form.resetFields();
        setSelectedFile(null);
        setPreviewUrl('');
        
        // Callback để thông báo thành công
        if (onSuccess) {
          onSuccess(response);
        }
      }

    } catch (error) {
      console.error('=== ERROR CREATING PRODUCT ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        const { status, data } = error.response;
        console.error(`API Error ${status}:`, data);
        
        switch (status) {
          case 400:
            message.error(`Dữ liệu không hợp lệ: ${data.message || JSON.stringify(data)}`);
            break;
          case 401:
            message.error('Bạn không có quyền thực hiện thao tác này!');
            break;
          case 403:
            message.error('Truy cập bị từ chối!');
            break;
          case 409:
            message.error('Tên sản phẩm đã tồn tại!');
            break;
          case 413:
            message.error('File quá lớn! Vui lòng chọn file nhỏ hơn.');
            break;
          case 415:
            message.error('Định dạng file không được hỗ trợ!');
            break;
          case 500:
            message.error('Lỗi server nội bộ!');
            break;
          default:
            message.error(`Lỗi API: ${status} - ${data.message || 'Không xác định'}`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        message.error('Không thể kết nối đến server! Kiểm tra backend có đang chạy không.');
      } else {
        console.error('Request setup error:', error.message);
        message.error(`Lỗi thiết lập request: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Props cho Upload component
  const uploadProps = {
    name: 'file',
    listType: 'picture-card',
    className: 'avatar-uploader',
    showUploadList: false,
    beforeUpload: (file) => {
      // Validate file type
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
      if (!isJpgOrPng) {
        message.error('Chỉ có thể upload file JPG/PNG!');
        return false;
      }
      
      // Validate file size (< 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Hình ảnh phải nhỏ hơn 5MB!');
        return false;
      }
      
      // Chọn file (không upload ngay)
      return handleFileSelect(file);
    },
  };

  // Xóa file đã chọn
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    message.info('Đã xóa hình ảnh!');
  };

  if (loading && categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại danh sách
          </Button>
          <h2 style={{ margin: 0 }}>Tạo mâm cúng mới</h2>
        </Space>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              productStatus: 'AVAILABLE'
            }}
          >
            {/* Thông tin cơ bản */}
            <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
              <Form.Item
                name="productName"
                label="Tên mâm cúng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên mâm cúng!' },
                  { min: 3, message: 'Tên mâm cúng phải ít nhất 3 ký tự!' },
                  { max: 200, message: 'Tên mâm cúng không được quá 200 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên mâm cúng..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Giá (VNĐ)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá!' },
                      { type: 'number', min: 1000, message: 'Giá phải lớn hơn 1,000 VNĐ!' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập giá..."
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="VNĐ"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="productStatus"
                    label="Trạng thái"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Option value="AVAILABLE">Có sẵn</Option>
                      <Option value="OUT_OF_STOCK">Hết hàng</Option>
                      <Option value="DISCONTINUED">Ngừng kinh doanh</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  >
                    <Select placeholder="Chọn danh mục" loading={categories.length === 0}>
                      {categories.map(category => (
                        <Option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="regionId"
                    label="Vùng miền"
                    rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}
                  >
                    <Select placeholder="Chọn vùng miền" loading={regions.length === 0}>
                      {regions.map(region => (
                        <Option key={region.regionId} value={region.regionId}>
                          {region.regionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="productDescription"
                label="Mô tả sản phẩm"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả!' },
                  { min: 10, message: 'Mô tả phải ít nhất 10 ký tự!' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Nhập mô tả chi tiết về mâm cúng..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </Card>

            {/* Submit buttons */}
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  {loading ? 'Đang tạo...' : 'Tạo mâm cúng'}
                </Button>
                <Button size="large" onClick={onBack}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Col>

        <Col span={8}>
          {/* Upload hình ảnh */}
          <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Upload {...uploadProps}>
                {previewUrl ? (
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={previewUrl}
                      alt="product preview"
                      style={{ width: 200, height: 200, objectFit: 'cover' }}
                      preview={false}
                    />
                    <Button
                      icon={<EyeOutlined />}
                      style={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => setPreviewVisible(true)}
                    />
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px' }}>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>
                      Chọn hình ảnh
                    </div>
                  </div>
                )}
              </Upload>
              
              {previewUrl && (
                <div style={{ marginTop: 8 }}>
                  <Button size="small" onClick={handleRemoveFile}>
                    Xóa hình ảnh
                  </Button>
                  <p style={{ marginTop: 4, color: '#666', fontSize: '12px' }}>
                    File: {selectedFile?.name}
                  </p>
                </div>
              )}
              
              {!previewUrl && (
                <p style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
                  Chọn hình ảnh (JPG, PNG &lt; 5MB)
                </p>
              )}
            </div>
          </Card>

          {/* Preview modal */}
          <Image
            width={200}
            style={{ display: 'none' }}
            src={previewUrl}
            preview={{
              visible: previewVisible,
              onVisibleChange: (visible) => setPreviewVisible(visible),
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CreateTrayProduct;