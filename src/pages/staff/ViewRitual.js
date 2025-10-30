import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Spin, Tag, Typography, Image, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CalendarOutlined, EnvironmentOutlined, InfoCircleOutlined, FileImageOutlined, EyeOutlined } from '@ant-design/icons';
import { ritualService } from '../../services/ritualService';

const { Title, Text, Paragraph } = Typography;

const ViewRitual = ({ ritualId, onBack, onEdit }) => {
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== VIEW RITUAL COMPONENT ===');
    console.log('Ritual ID:', ritualId);
    
    const fetchRitualDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching ritual details for ID:', ritualId);
        
        const data = await ritualService.getRitualById(ritualId);
        
        console.log('Ritual details response:', data);
        console.log('Image URL from response:', data.imageUrl);
        
        setRitual(data);
      } catch (error) {
        console.error('Error fetching ritual details:', error);
        console.error('Error response:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (ritualId) {
      fetchRitualDetails();
    }
  }, [ritualId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải thông tin lễ hội..." />
      </div>
    );
  }

  if (!ritual) {
    return (
      <Card>
        <Empty description="Không tìm thấy thông tin lễ hội" />
        <div className="text-center mt-4">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-vietnam-cream min-h-screen p-6 font-sans">
      {/* Header */}
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-red !mb-1">
              <Space>
                <InfoCircleOutlined />
                Chi tiết Lễ hội
              </Space>
            </Title>
            <Text type="secondary">Xem thông tin chi tiết về lễ hội truyền thống</Text>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Quay lại
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(ritualId)}
              className="bg-vietnam-red hover:!bg-red-800"
            >
              Chỉnh sửa
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image */}
        <div className="lg:col-span-1">
          <Card 
            title={
              <Space>
                <FileImageOutlined />
                Hình ảnh lễ hội
              </Space>
            }
            className="shadow-lg rounded-xl h-full"
          >
            {ritual.imageUrl ? (
              <div className="text-center">
                <Image
                  src={ritual.imageUrl}
                  alt={ritual.ritualName}
                  style={{ 
                    width: '100%', 
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  fallback="data:image/png;base64,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"
                  preview={{
                    mask: <Space><EyeOutlined /> Xem ảnh</Space>
                  }}
                />
                <Paragraph className="mt-4 text-gray-500 text-xs">
                  URL: <Text copyable ellipsis>{ritual.imageUrl}</Text>
                </Paragraph>
              </div>
            ) : (
              <Empty 
                description="Chưa có hình ảnh"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="font-serif !text-vietnam-red mb-4">
              {ritual.ritualName}
            </Title>
            
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item 
                label={<Space><CalendarOutlined /> Ngày âm lịch</Space>}
              >
                <Tag color="blue">{ritual.dateLunar || 'Chưa cập nhật'}</Tag>
              </Descriptions.Item>

              <Descriptions.Item 
                label={<Space><CalendarOutlined /> Ngày dương lịch</Space>}
              >
                {ritual.dateSolar ? (
                  <Tag color="green">
                    {new Date(ritual.dateSolar).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Tag>
                ) : (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item 
                label={<Space><EnvironmentOutlined /> Vùng miền</Space>}
              >
                <Tag color="gold">{ritual.regionName}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Mô tả">
                <Paragraph>{ritual.description || 'Chưa có mô tả'}</Paragraph>
              </Descriptions.Item>

              <Descriptions.Item label="Ý nghĩa">
                <Paragraph>{ritual.meaning || 'Chưa có ý nghĩa'}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewRitual;