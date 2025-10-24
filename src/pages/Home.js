// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-[60vh] bg-vietnam-cream">
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-vietnam-red mb-4">
          Chào mừng đến với Nhắc Nhớ Việt
        </h1>
        <p className="text-gray-700 mb-8">
          Trang chủ sẽ được cập nhật sớm. Trong lúc đó, bạn có thể tra cứu lễ hội ngay.
        </p>
        <Link to="/rituals" className="btn-primary">
          Đi tới Tra cứu lễ
        </Link>
      </section>
    </div>
  );
};

export default Home;
