// src/pages/admin/components/EditRitual.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Space, Upload, Tag, message, Spin, Typography, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const EditRitual = ({ ritualId, onBack, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [traditions, setTraditions] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [newTradition, setNewTradition] = useState('');
  const [newOffering, setNewOffering] = useState('');

  // NOTE: Logic fetching MOCK DATA is kept as is.
  useEffect(() => {
    const fetchRitualDetail = () => {
      setLoading(true);
      setTimeout(() => {
        const mockRitual = {
          id: ritualId,
          name: ritualId === 1 ? 'Tết Nguyên Đán' : 'Lễ hội Chọi trâu Đồ Sơn',
          region: 'Toàn quốc', status: 'active',
          description: 'Mô tả chi tiết...',
          traditions: ['Dọn dẹp nhà cửa', 'Cúng ông Táo'],
          offerings: ['Bánh chưng', 'Bánh tét']
        };
        form.setFieldsValue(mockRitual);
        setTraditions(mockRitual.traditions);
        setOfferings(mockRitual.offerings);
        setLoading(false);
      }, 500);
    };
    if (ritualId) fetchRitualDetail();
  }, [ritualId, form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedRitual = { ...values, traditions, offerings, id: ritualId };
      console.log('Cập nhật lễ hội:', updatedRitual);
      message.success('Cập nhật lễ hội thành công!');
      if (onSave) onSave(updatedRitual);
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật!');
    } finally {
      setSaving(false);
    }
  };

  const addTag = (type) => {
    if (type === 'tradition' && newTradition && !traditions.includes(newTradition)) {
      setTraditions([...traditions, newTradition]);
      setNewTradition('');
    } else if (type === 'offering' && newOffering && !offerings.includes(newOffering)) {
      setOfferings([...offerings, newOffering]);
      setNewOffering('');
    }
  };

  const removeTag = (type, tagToRemove) => {
    if (type === 'tradition') {
      setTraditions(traditions.filter(tag => tag !== tagToRemove));
    } else if (type === 'offering') {
      setOfferings(offerings.filter(tag => tag !== tagToRemove));
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-96"><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
  }

  return (
    <div className="font-sans">
       <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <Title level={2} className="font-serif !text-vietnam-red !mb-1">
                        <Space><BookOutlined /> Chỉnh sửa Lễ hội</Space>
                    </Title>
                    <Text type="secondary">Cập nhật thông tin chi tiết cho nghi lễ.</Text>
                </div>
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại</Button>
            </div>
      </Card>
      
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Card className="shadow-lg rounded-xl mb-6">
            <Title level={4} className="font-serif !text-vietnam-red">Thông tin cơ bản</Title>
            <Form.Item name="name" label="Tên lễ hội" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input />
            </Form.Item>
            <Form.Item name="region" label="Vùng miền" rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}>
                <Select>
                    <Option value="Toàn quốc">Toàn quốc</Option>
                    <Option value="Miền Bắc">Miền Bắc</Option>
                    <Option value="Miền Trung">Miền Trung</Option>
                    <Option value="Miền Nam">Miền Nam</Option>
                </Select>
            </Form.Item>
             <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                <TextArea rows={4} />
            </Form.Item>
        </Card>

        <Card className="shadow-lg rounded-xl mb-6">
            <Title level={4} className="font-serif !text-vietnam-red">Truyền thống & Vật phẩm</Title>
             <div className="mb-4">
                <Text strong>Hoạt động truyền thống</Text>
                <div className="my-2">{traditions.map(tag => <Tag closable onClose={() => removeTag('tradition', tag)} key={tag} color="geekblue">{tag}</Tag>)}</div>
                <Space.Compact className="w-full"><Input value={newTradition} onChange={e => setNewTradition(e.target.value)} /><Button onClick={() => addTag('tradition')}>Thêm</Button></Space.Compact>
            </div>
            <div>
                <Text strong>Vật phẩm cúng</Text>
                <div className="my-2">{offerings.map(tag => <Tag closable onClose={() => removeTag('offering', tag)} key={tag} color="gold">{tag}</Tag>)}</div>
                <Space.Compact className="w-full"><Input value={newOffering} onChange={e => setNewOffering(e.target.value)} /><Button onClick={() => addTag('offering')}>Thêm</Button></Space.Compact>
            </div>
        </Card>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large" className="bg-vietnam-red hover:!bg-red-800">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button size="large" onClick={onBack}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditRitual;