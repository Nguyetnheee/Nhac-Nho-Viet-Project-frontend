import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Image, Button, Space, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ViewRitual = ({ ritualId, onBack, onEdit }) => {
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call để lấy chi tiết lễ hội
    const fetchRitualDetail = () => {
      setLoading(true);
      
      // Mock data - thay thế bằng API call thực tế
      setTimeout(() => {
        const mockRitual = {
          id: ritualId,
          name: ritualId === 1 ? 'Tết Nguyên Đán' : 'Lễ hội Chợ trâu Đồ Sơn',
          region: ritualId === 1 ? 'Toàn quốc' : 'Miền Bắc',
          date: ritualId === 1 ? '01/01/2025' : null,
          status: 'active',
          description: ritualId === 1 
            ? 'Tết Nguyên Đán là ngày lễ quan trọng nhất trong năm của người Việt Nam, đánh dấu sự khởi đầu của năm mới theo âm lịch. Đây là dịp để gia đình sum họp, thờ cúng tổ tiên và cầu chúc một năm mới an khang thịnh vượng.'
            : 'Lễ hội Chợ trâu Đồ Sơn là một lễ hội truyền thống độc đáo của vùng đất Hải Phòng, thể hiện nét văn hóa đặc sắc của người dân miền Bắc.',
          traditions: ritualId === 1 
            ? ['Dọn dẹp nhà cửa', 'Cúng ông Táo', 'Cúng giao thừa', 'Lì xì', 'Chúc Tết', 'Thăm họ hàng']
            : ['Tắm trâu', 'Diễu hành', 'Thi đấu', 'Ăn mừng'],
          offerings: ritualId === 1
            ? ['Bánh chưng', 'Bánh tét', 'Thịt luộc', 'Gà luộc', 'Rượu cần', 'Hoa quả', 'Bánh kẹo']
            : ['Cơm', 'Thịt', 'Rượu', 'Hoa quả'],
          images: [
            'https://via.placeholder.com/300x200?text=Ritual+Image+1',
            'https://via.placeholder.com/300x200?text=Ritual+Image+2',
            'https://via.placeholder.com/300x200?text=Ritual+Image+3'
          ],
          createdAt: '2024-01-15',
          updatedAt: '2024-10-20'
        };
        
        setRitual(mockRitual);
        setLoading(false);
      }, 1000);
    };

    if (ritualId) {
      fetchRitualDetail();
    }
  }, [ritualId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin lễ hội...</p>
      </div>
    );
  }

  if (!ritual) {
    return (
      <Alert
        message="Không tìm thấy thông tin lễ hội"
        type="error"
        showIcon
        action={
          <Button size="small" onClick={onBack}>
            Quay lại
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Header với nút quay lại */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại danh sách
          </Button>
          <h2 style={{ margin: 0 }}>Chi tiết lễ hội: {ritual.name}</h2>
        </Space>
        
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(ritual.id)}>
            Chỉnh sửa
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Xóa lễ hội
          </Button>
        </Space>
      </div>

      {/* Thông tin cơ bản */}
      <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID" span={1}>
            {ritual.id}
          </Descriptions.Item>
          <Descriptions.Item label="Tên lễ hội" span={1}>
            <strong>{ritual.name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Vùng miền" span={1}>
            <Tag color="blue">{ritual.region}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày diễn ra" span={1}>
            {ritual.date || 'Chưa xác định'}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={ritual.status === 'active' ? 'green' : 'red'}>
              {ritual.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            {ritual.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {ritual.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Truyền thống & Phong tục */}
      <Card title="Truyền thống & Phong tục" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <strong>Các hoạt động truyền thống:</strong>
          <div style={{ marginTop: 8 }}>
            {ritual.traditions.map((tradition, index) => (
              <Tag key={index} color="purple" style={{ margin: '4px 4px 4px 0' }}>
                {tradition}
              </Tag>
            ))}
          </div>
        </div>
        
        <div>
          <strong>Đồ cúng truyền thống:</strong>
          <div style={{ marginTop: 8 }}>
            {ritual.offerings.map((offering, index) => (
              <Tag key={index} color="orange" style={{ margin: '4px 4px 4px 0' }}>
                {offering}
              </Tag>
            ))}
          </div>
        </div>
      </Card>

      {/* Hình ảnh */}
      <Card title="Hình ảnh lễ hội">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {ritual.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`${ritual.name} - Hình ${index + 1}`}
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ViewRitual;