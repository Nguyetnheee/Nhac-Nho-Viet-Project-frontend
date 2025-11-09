// src/pages/admin/components/EditRitual.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Space, Upload, message, Spin, Typography, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons';
import { ritualService } from '../../services/ritualService';
import regionService from '../../services/regionService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const EditRitual = ({ ritualId, onBack, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [regions, setRegions] = useState([]);
  const [ritualData, setRitualData] = useState(null);

  // NOTE: Logic fetching MOCK DATA is kept as is.
  useEffect(() => {
    const fetchRitualDetail = async () => {
      setLoading(true);
      try {
        const [ritualRes, regionsRes] = await Promise.all([
          ritualService.getRitualById(ritualId),
          regionService.getAllRegions()
        ]);
        
        setRitualData(ritualRes);
        setRegions(regionsRes || []);
        setCurrentImageUrl(ritualRes.imageUrl || '');
        
        form.setFieldsValue({
          ritualName: ritualRes.ritualName,
          regionId: ritualRes.regionId,
          dateLunar: ritualRes.dateLunar,
          dateSolar: ritualRes.dateSolar,
          description: ritualRes.description,
          meaning: ritualRes.meaning
        });
        
        setLoading(false);
      } catch (error) {
        message.error('Không thể tải dữ liệu lễ hội!');
        setLoading(false);
      }
    };
    
    if (ritualId) fetchRitualDetail();
  }, [ritualId, form]);

  const handleFileSelect = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file ảnh!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
    message.success('Đã chọn hình ảnh mới!');
    return false;
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const response = await ritualService.updateRitual(ritualId, values, selectedFile);
      message.success('Cập nhật lễ hội thành công!');
      if (onSave) onSave(response);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật lễ hội thất bại!';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-96"><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
  }

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className="font-sans">
       <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <Title level={2} className="font-serif !text-vietnam-green !mb-1">
                        <Space><BookOutlined /> Chỉnh sửa Lễ hội</Space>
                    </Title>
                    <Text type="secondary">Cập nhật thông tin chi tiết cho nghi lễ.</Text>
                </div>
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại</Button>
            </div>
      </Card>
      
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
                <Title level={4} className="font-serif !text-vietnam-green">Thông tin cơ bản</Title>
                <Form.Item name="ritualName" label="Tên lễ hội" rules={[{ required: true, message: 'Vui lòng nhập tên lễ hội!' }]}>
                    <Input />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="regionId" label="Vùng miền" rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}>
                        <Select placeholder="Chọn vùng miền" loading={regions.length === 0}>
                          {regions.map(r => <Option key={r.regionId} value={r.regionId}>{r.regionName}</Option>)}
                        </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="dateLunar" label="Ngày Âm lịch">
                        <Input placeholder="VD: 1/1" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="dateSolar" label="Ngày Dương lịch">
                    <Input placeholder="VD: 01/01" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                    <TextArea rows={4} showCount maxLength={20000} />
                </Form.Item>

                <Form.Item name="meaning" label="Ý nghĩa">
                    <TextArea rows={3} showCount maxLength={20000} />
                </Form.Item>
            </Card>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large" className="bg-vietnam-green hover:!bg-emerald-800">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button size="large" onClick={onBack}>Hủy</Button>
              </Space>
            </Form.Item>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Hình ảnh lễ hội" className="shadow-lg rounded-xl text-center">
              <Upload listType="picture-card" className="avatar-uploader" showUploadList={false} beforeUpload={handleFileSelect}>
                {displayImageUrl ? (
                  <img src={displayImageUrl} alt="preview" style={{ width: '100%' }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div className="mt-2">Chọn ảnh</div>
                  </div>
                )}
              </Upload>
              {previewUrl && (
                <Button size="small" className="mt-2" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}>
                  Hủy ảnh mới
                </Button>
              )}
              <Text type="secondary" className="block mt-2 text-xs">
                {previewUrl ? `Đang sử dụng ảnh mới` : currentImageUrl ? `Đang sử dụng ảnh hiện tại` : 'Chưa có ảnh'}
              </Text>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditRitual;