import React, { useState, useEffect } from 'react';
import { MailOutlined } from '@ant-design/icons';
import api from '../services/api';

const NewsletterStats = () => {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const response = await api.get('/api/newsletter/subscribers/count');
      setSubscriberCount(response.data);
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <MailOutlined className="text-2xl" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Newsletter Subscribers</p>
          <p className="text-2xl font-semibold text-gray-900">{subscriberCount}</p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterStats;
