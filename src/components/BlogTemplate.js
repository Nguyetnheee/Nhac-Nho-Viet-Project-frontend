// src/components/BlogTemplate.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

/**
 * Template component cho các trang blog/chính sách
 * @param {Object} props
 * @param {string} props.title - Tiêu đề bài viết
 * @param {string} props.image - URL hình ảnh chính
 * @param {string} props.date - Ngày đăng (optional)
 * @param {string} props.author - Tác giả (optional)
 * @param {React.ReactNode} props.children - Nội dung bài viết
 * @param {Array} props.relatedLinks - Danh sách link liên quan (optional)
 */
const BlogTemplate = ({ 
  title, 
  image, 
  date = "10/11/2025", 
  author = "Nhắc Nhớ Việt",
  children,
  relatedLinks = []
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-vietnam-cream">
      {/* Header với background gradient */}
      <div className="bg-gradient-to-r from-vietnam-green to-emerald-700 py-8 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => navigate('/aboutUs')}
            className="flex items-center gap-2 text-white hover:text-vietnam-gold transition-colors mb-4"
          >
            <ArrowLeftOutlined />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-green-100 text-sm">
            <span>{date}</span>
            <span>•</span>
            <span>{author}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Featured Image */}
        {image && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={image} 
              alt={title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </article>

        {/* Related Links Section */}
        {relatedLinks.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-serif font-bold text-vietnam-green mb-6">
              Bài viết liên quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-vietnam-gold hover:bg-vietnam-cream transition-all"
                >
                  <span className="text-vietnam-green hover:text-vietnam-gold font-medium">
                    {link.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div 
          className="mt-12 relative rounded-2xl shadow-lg p-8 text-center text-white overflow-hidden"
          style={{
            backgroundImage: 'url(/hero-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-r from-vietnam-green to-emerald-700 opacity-80"
          ></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold mb-4">
              Cần tư vấn thêm?
            </h3>
            <p className="mb-6 text-green-100">
              Liên hệ với chúng tôi để được hỗ trợ tận tình
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:0123456789"
                className="inline-flex items-center gap-2 bg-white text-vietnam-green px-6 py-3 rounded-lg font-semibold hover:bg-vietnam-gold hover:text-white transition-colors"
              >
                Hotline: 0123 456 789
              </a>
              <a
                href="mailto:contact@nhacnhoviet.vn"
                className="inline-flex items-center gap-2 bg-vietnam-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Email: contact@nhacnhoviet.vn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogTemplate;
