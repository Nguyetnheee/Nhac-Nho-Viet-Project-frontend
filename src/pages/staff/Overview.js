import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';

const Overview = () => {
  return (
    <div>
      <h2>Tổng quan hệ thống</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={1128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={93}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={112893}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={93}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Overview;