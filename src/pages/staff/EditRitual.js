import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Space, 
  Upload, 
  Tag, 
  message,
  Spin,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  PlusOutlined, 
  UploadOutlined,
  CloseOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const EditRitual = ({ ritualId, onBack, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [traditions, setTraditions] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [newTradition, setNewTradition] = useState('');
  const [newOffering, setNewOffering] = useState('');

  useEffect(() => {
    // Simulate API call để lấy chi tiết lễ hội
    const fetchRitualDetail = () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockRitual = {
          id: ritualId,
          name: ritualId === 1 ? 'Tết Nguyên Đán' : 'Lễ hội Chợ trâu Đồ Sơn',
          region: ritualId === 1 ? 'Toàn quốc' : 'Miền Bắc',
          date: ritualId === 1 ? '01/01/2025' : '',
          status: 'active',
          description: ritualId === 1 
            ? 'Tết Nguyên Đán là ngày lễ quan trọng nhất trong năm của người Việt Nam, đánh dấu sự khởi đầu của năm mới theo âm lịch.'
            : 'Lễ hội Chợ trâu Đồ Sơn là một lễ hội truyền thống độc đáo của vùng đất Hải Phòng.',
          traditions: ritualId === 1 
            ? ['Dọn dẹp nhà cửa', 'Cúng ông Táo', 'Cúng giao thừa', 'Lì xì']
            : ['Tắm trâu', 'Diễu hành', 'Thi đấu'],
          offerings: ritualId === 1
            ? ['Bánh chưng', 'Bánh tét', 'Thịt luộc', 'Gà luộc']
            : ['Cơm', 'Thịt', 'Rượu']
        };
        
        // Set form values
        form.setFieldsValue(mockRitual);
        setTraditions(mockRitual.traditions);
        setOfferings(mockRitual.offerings);
        setLoading(false);
      }, 1000);
    };

    if (ritualId) {
      fetchRitualDetail();
    }
  }, [ritualId, form]);

  const handleSave = async (values) => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedRitual = {
        ...values,
        traditions,
        offerings,
        id: ritualId
      };
      
      console.log('Cập nhật lễ hội:', updatedRitual);
      message.success('Cập nhật lễ hội thành công!');
      
      // Call onSave callback
      if (onSave) {
        onSave(updatedRitual);
      }
      
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật lễ hội!');
    } finally {
      setSaving(false);
    }
  };

  const addTradition = () => {
    if (newTradition && !traditions.includes(newTradition)) {
      setTraditions([...traditions, newTradition]);
      setNewTradition('');
    }
  };

  const removeTradition = (tradition) => {
    setTraditions(traditions.filter(t => t !== tradition));
  };

  const addOffering = () => {
    if (newOffering && !offerings.includes(newOffering)) {
      setOfferings([...offerings, newOffering]);
      setNewOffering('');
    }
  };

  const removeOffering = (offering) => {
    setOfferings(offerings.filter(o => o !== offering));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin lễ hội...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
          <h2 style={{ margin: 0 }}>Chỉnh sửa lễ hội</h2>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ maxWidth: 800 }}
      >
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
          <Form.Item
            name="name"
            label="Tên lễ hội"
            rules={[{ required: true, message: 'Vui lòng nhập tên lễ hội!' }]}
          >
            <Input placeholder="Nhập tên lễ hội..." />
          </Form.Item>

          <Form.Item
            name="region"
            label="Vùng miền"
            rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}
          >
            <Select placeholder="Chọn vùng miền">
              <Option value="Toàn quốc">Toàn quốc</Option>
              <Option value="Miền Bắc">Miền Bắc</Option>
              <Option value="Miền Trung">Miền Trung</Option>
              <Option value="Miền Nam">Miền Nam</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày diễn ra"
          >
            <Input placeholder="VD: 01/01/2025" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả lễ hội..." />
          </Form.Item>
        </Card>

        {/* Truyền thống */}
        <Card title="Truyền thống & Phong tục" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>Hoạt động truyền thống:</strong>
            <div style={{ marginTop: 8, marginBottom: 12 }}>
              {traditions.map((tradition, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeTradition(tradition)}
                  color="purple"
                  style={{ margin: '4px 4px 4px 0' }}
                >
                  {tradition}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Thêm hoạt động truyền thống..."
                value={newTradition}
                onChange={(e) => setNewTradition(e.target.value)}
                onPressEnter={addTradition}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={addTradition}>
                Thêm
              </Button>
            </Space.Compact>
          </div>

          <div>
            <strong>Đồ cúng truyền thống:</strong>
            <div style={{ marginTop: 8, marginBottom: 12 }}>
              {offerings.map((offering, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeOffering(offering)}
                  color="orange"
                  style={{ margin: '4px 4px 4px 0' }}
                >
                  {offering}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Thêm đồ cúng..."
                value={newOffering}
                onChange={(e) => setNewOffering(e.target.value)}
                onPressEnter={addOffering}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={addOffering}>
                Thêm
              </Button>
            </Space.Compact>
          </div>
        </Card>

        {/* Hình ảnh */}
        <Card title="Hình ảnh" style={{ marginBottom: 24 }}>
          <Upload
            listType="picture-card"
            multiple
            maxCount={5}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Card>

        {/* Submit buttons */}
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={saving}
              size="large"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button size="large" onClick={onBack}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditRitual;