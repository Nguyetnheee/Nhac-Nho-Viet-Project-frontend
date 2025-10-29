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
  Image,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

// Import services
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import regionService from '../../services/regionService';

const { TextArea } = Input;
const { Option } = Select;

const EditTrayProduct = ({ productId, onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // File mới (nếu có)
  const [previewUrl, setPreviewUrl] = useState(''); // URL preview file mới
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // Ảnh hiện tại từ DB
  const [previewVisible, setPreviewVisible] = useState(false);
  const [productData, setProductData] = useState(null);

  // Load dữ liệu ban đầu
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        console.log('Loading initial data for product ID:', productId);
        
        // Load song song: product details, categories, regions
        const [productRes, categoriesRes, regionsRes] = await Promise.all([
          productService.getProductById(productId),
          categoryService.getAllCategories(),
          regionService.getAllRegions()
        ]);

        console.log('Loaded product data:', productRes);
        console.log('Loaded categories:', categoriesRes);
        console.log('Loaded regions:', regionsRes);

        setProductData(productRes);
        setCategories(categoriesRes || []);
        setRegions(regionsRes || []);
        setCurrentImageUrl(productRes.productImage || '');

        // Điền dữ liệu vào form
        form.setFieldsValue({
          productName: productRes.productName,
          price: productRes.price,
          productDescription: productRes.productDescription,
          categoryId: productRes.categoryId,
          regionId: productRes.regionId,
          productStatus: productRes.productStatus
        });
        
        console.log('Form initialized with data');
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        
        if (error.response?.status === 404) {
          message.error('Không tìm thấy sản phẩm này!');
        } else if (error.response?.status === 403) {
          message.error('Bạn không có quyền xem sản phẩm này!');
        } else {
          message.error('Không thể tải dữ liệu sản phẩm!');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    if (productId) {
      loadInitialData();
    }
  }, [productId, form]);

  // Xử lý chọn file mới
  const handleFileSelect = (file) => {
    console.log('New file selected:', file);
    
    // Lưu file mới
    setSelectedFile(file);
    
    // Tạo URL preview cho file mới
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    
    message.success('Đã chọn hình ảnh mới!');
    return false; // Prevent automatic upload
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu sản phẩm
      const updateData = {
        productName: values.productName,
        price: Number(values.price),
        productDescription: values.productDescription,
        categoryId: Number(values.categoryId),
        regionId: Number(values.regionId),
        productStatus: values.productStatus
      };

      console.log('=== UPDATING PRODUCT ===');
      console.log('Product ID:', productId);
      console.log('Update data:', updateData);
      console.log('New file:', selectedFile);

      // Gọi API cập nhật sản phẩm
      const response = await productService.updateProduct(productId, updateData, selectedFile);
      
      console.log('=== UPDATE RESPONSE ===', response);

      if (response) {
        message.success('Cập nhật mâm cúng thành công!');
        
        // Callback để thông báo thành công
        if (onSuccess) {
          onSuccess(response);
        }
      }

    } catch (error) {
      console.error('=== ERROR UPDATING PRODUCT ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      
      // Xử lý các loại lỗi
      if (error.response) {
        const { status, data } = error.response;
        console.error(`API Error ${status}:`, data);
        
        switch (status) {
          case 400:
            message.error(`Dữ liệu không hợp lệ: ${data.message || JSON.stringify(data)}`);
            break;
          case 401:
            message.error('Token không hợp lệ! Vui lòng đăng nhập lại.');
            break;
          case 403:
            message.error('Bạn không có quyền chỉnh sửa sản phẩm này!');
            break;
          case 404:
            message.error('Không tìm thấy sản phẩm!');
            break;
          case 409:
            message.error('Tên sản phẩm đã tồn tại!');
            break;
          case 500:
            message.error('Lỗi server nội bộ!');
            break;
          default:
            message.error(`Lỗi API: ${status} - ${data.message || 'Không xác định'}`);
        }
      } else if (error.request) {
        message.error('Không thể kết nối đến server!');
      } else {
        message.error(`Lỗi: ${error.message}`);
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
      
      // Chọn file mới
      return handleFileSelect(file);
    },
  };

  // Xóa file mới đã chọn (quay về ảnh cũ)
  const handleRemoveNewFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    message.info('Đã hủy hình ảnh mới!');
  };

  // Hiển thị loading khi đang tải dữ liệu ban đầu
  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  // Hiển thị lỗi nếu không tìm thấy sản phẩm
  if (!productData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert
          message="Không tìm thấy sản phẩm"
          description="Sản phẩm không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
          action={
            <Button onClick={onBack}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  // Xác định ảnh nào sẽ hiển thị (ưu tiên ảnh mới)
  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại danh sách
          </Button>
          <h2 style={{ margin: 0 }}>
            <EditOutlined /> Chỉnh sửa mâm cúng
          </h2>
        </Space>
      </div>

      {/* Thông báo */}
      <Alert
        message="Đang chỉnh sửa sản phẩm"
        description={`ID: ${productId} - ${productData.productName}`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        <Col span={16}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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
                  {loading ? 'Đang cập nhật...' : 'Cập nhật mâm cúng'}
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
                {displayImageUrl ? (
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={displayImageUrl}
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
                      Chọn hình ảnh mới
                    </div>
                  </div>
                )}
              </Upload>
              
              {/* Thông tin về ảnh */}
              <div style={{ marginTop: 8 }}>
                {previewUrl && (
                  <div>
                    <Button size="small" onClick={handleRemoveNewFile}>
                      Hủy ảnh mới
                    </Button>
                    <p style={{ marginTop: 4, color: '#52c41a', fontSize: '12px' }}>
                      ✓ Ảnh mới: {selectedFile?.name}
                    </p>
                  </div>
                )}
                
                {currentImageUrl && !previewUrl && (
                  <p style={{ color: '#666', fontSize: '12px' }}>
                    Ảnh hiện tại từ database
                  </p>
                )}
                
                {!displayImageUrl && (
                  <p style={{ color: '#999', fontSize: '12px' }}>
                    Chọn hình ảnh mới (JPG, PNG &lt; 5MB)
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Preview modal */}
          <Image
            width={200}
            style={{ display: 'none' }}
            src={displayImageUrl}
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

export default EditTrayProduct;