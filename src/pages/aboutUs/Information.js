import React from "react";

const Information = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Tiêu đề bài viết */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="detail_page">
          <h1
            className="text-3xl font-bold text-gray-800 mb-4 text-center"
            itemProp="headline"
          >
            Giới Thiệu Nhắc Nhớ Việt, Đồ Cúng Tận Tâm An Tâm Mọi Nhà
          </h1>

          {/* Metadata SEO */}
          {/* <meta itemProp="datePublished" content="2024-11-15" />
          <meta itemProp="dateModified" content="2024-11-15" /> */}
          {/* <meta
            itemProp="description"
            content="Giới thiệu về thương hiệu Nhắc Nhớ Việt, Đồ Cúng Tận Tâm..."
          /> */}

          {/* Ngày đăng
          <em className="block text-gray-500 text-sm mb-6">
            <i className="fa fa-calendar mr-1"></i> Đăng ngày 15-11-2024
          </em> */}

          {/* Nội dung bài viết */}
          <div className="info_g prose prose-lg max-w-none text-gray-800">
            {/* <h1>
              <strong>Giới Thiệu Về Nhắc Nhớ Việt, Đồ Cúng Tận Tâm</strong>
            </h1> */}

            <figure className="my-10">
              <img
                src="https://pos.nvncdn.com/26fee5-146732/bn/20240521_GyWq6ymC.gif"
                alt="Ảnh bìa Nhắc Nhớ Việt"
                className="w-full rounded-lg"
              />
            </figure>
            <div className="text-2xl py-2">
            <h2>
              <strong>1. Nhắc Nhớ Việt, Đồ Cúng Tận Tâm An Tâm Mọi Nhà Là Ai?</strong>
            </h2>
            </div>
            <div className="text-lg py-2">
            <p>
              Nhắc Nhớ Việt, Đồ Cúng Tận Tâm An Tâm Mọi Nhà là thương hiệu uy tín, chuyên cung
              cấp các sản phẩm đồ lễ, đồ cúng chất lượng, phục vụ cho các nghi
              lễ tâm linh và truyền thống của người Việt...
            </p>
            </div>
 <div className="text-2xl py-2">
<h2>
              <strong>2. Sản Phẩm và Dịch Vụ Mà Chúng Mình Cung Cấp</strong>
            </h2>
 </div>
             <div className="text-lg py-2">
 <p>
              Chúng mình không chỉ nổi bật với các sản phẩm đồ lễ cúng, mà còn cung cấp
              dịch vụ hỗ trợ khách hàng trong việc tổ chức các nghi lễ truyền
              thống...
            </p>
             </div>

 <div className="text-lg py-2">
<h3>
              <strong>*Các sản phẩm chính của Nhắc Nhớ Việt cung cấp:</strong>
            </h3>
 </div>
            
            <ul className="text-lg list-disc pl-6 py-2">
              <li>
                <strong>Mâm Lễ Cúng Thần Linh:</strong> gồm hoa quả, bánh trái,
                hương, đèn, trầm hương, nước, rượu...
              </li>
              <li>
                <strong>Mâm Lễ Cúng Gia Tiên:</strong> chuẩn bị chu đáo, lễ vật
                tươi ngon, đẹp mắt...
              </li>
              <li>
                <strong>Mâm Cúng Khai Trương:</strong> mang lại may mắn, thuận
                lợi cho kinh doanh...
              </li>
              <li>
                <strong>Mâm Lễ Nhập Trạch:</strong> giúp gia chủ bình an, may
                mắn khi chuyển nhà...
              </li>
              <li>
                <strong>Mâm Lễ Tết và Lễ Giỗ:</strong> đầy đủ, tinh tế, phù hợp
                truyền thống Việt.
              </li>
            </ul>
 <div className="text-lg py-2">
 <h3>
              <strong>*Dịch vụ hỗ trợ khách hàng:</strong>
            </h3>
 </div>
           
            <ul className="list-disc pl-6 py-2 text-lg">
              <li>Tư vấn chọn mâm lễ phù hợp từng dịp</li>
              <li>Kết nối thầy cúng uy tín</li>
              <li>Giao hàng tận nơi, đúng giờ</li>
              <li>Đổi trả nếu sản phẩm không đúng yêu cầu</li>
            </ul>
              <div className="text-2xl py-2">
            <h2>
              <strong>3. Tại Sao Chọn Nhắc Nhớ Việt, Đồ Cúng Tận Tâm An Tâm Mọi Nhà?</strong>
            </h2>
</div>
           <div className="text-lg py-2">
            <h4>
              <strong>3.1. Chất Lượng Từ Tâm</strong>
            </h4>
            </div>
            <div className="text-lg py-2">
 <p>
              Mỗi sản phẩm được chọn lọc kỹ lưỡng từ nhà cung cấp uy tín, đảm
              bảo lễ vật luôn tươi mới và đúng chuẩn.
            </p>
            </div>
           <div className="text-lg py-2">
 <h4>
              <strong>3.2. Đội Ngũ Chuyên Nghiệp</strong>
            </h4>
           </div>
           <div className="text-lg py-2">
<p>
              Đội ngũ nhân viên có kinh nghiệm, am hiểu phong tục lễ cúng từng vùng
              miền.
            </p>
           </div>
            <div className="text-lg py-2">
                 <h4>
              <strong>3.3. Dịch Vụ Tận Tâm</strong>
            </h4>
            </div>
           <div className="text-lg py-2">
<p>
              Từ tư vấn, chuẩn bị đến giao hàng - Nhắc Nhớ Việt luôn đặt tâm huyết vào từng
              chi tiết nhỏ nhất.
            </p>
           </div>
             <div className="text-2xl py-2">
            <h2>
              <strong>4. Các Câu Hỏi Thường Gặp Về Nhắc Nhớ Việt</strong>
            </h2>
</div>
 <div className="text-lg py-2">
            <h4>
              <strong>4.1. Nhắc Nhớ Việt cung cấp những loại mâm lễ nào?</strong>
            </h4>
            </div>
             <div className="text-lg py-2">
<p>
             Nhắc Nhớ Việt cung cấp đầy đủ các mâm lễ cho các dịp như: khai trương, nhập trạch, gia tiên, Thần Tài, động thổ, Tết, lễ giỗ.
            </p>
           </div>

<div className="text-lg py-2">
            <h4>
              <strong>4.2. Làm thế nào để đặt lễ tại Nhắc Nhớ Việt? </strong>
            </h4>
            </div>
             <div className="text-lg py-2">
<p>
             Quý khách có thể đặt hàng qua hotline, website để nhận tư vấn và hỗ trợ.
            </p>
           </div>

           <div className="text-lg py-2">
            <h4>
              <strong>4.3.Lễ vật có đảm bảo đúng phong tục không?</strong>
            </h4>
            </div>
             <div className="text-lg py-2">
<p>
             Chúng tôi cam kết tất cả lễ vật được chuẩn bị đúng theo phong tục và yêu cầu của từng nghi lễ.
            </p>
           </div>

<div className="text-lg py-2">
            <h4>
              <strong>4.4. Nhắc Nhớ Việt có giao hàng không?</strong>
            </h4>
            </div>
             <div className="text-lg py-2">
<p>
             Chúng tôi hỗ trợ giao hàng tận nơi, đảm bảo lễ vật được vận chuyển an toàn và đúng giờ.
            </p>
           </div>

<div className="text-lg py-2">
            <h4>
              <strong>4.5. Làm sao để kết nối với thầy cúng?</strong>
            </h4>
            </div>
             <div className="text-lg py-2">
<p>
             Quý khách chỉ cần liên hệ với NNV, chúng tôi sẽ kết nối với các thầy cúng uy tín phù hợp với nghi lễ của bạn
            </p>
           </div>

<div className="text-lg py-2">
            <h4>
              <strong>4.6. Nhắc Nhớ Việt có chính sách đổi trả không?</strong>
            </h4>
            </div>
             <div className="text-lg py-2">
<p>
             Nếu sản phẩm có lỗi hoặc không đúng yêu cầu, Nhắc Nhớ Việt sẽ hỗ trợ đổi trả theo chính sách đã công bố.
            </p>
           </div>

           <div className="text-lg py-2">
            <h4>
              <strong>4.7. Làm sao để tư vấn chọn mâm lễ phù hợp?</strong>
            </h4>
            </div>
             <div className="text-lg py-2">
  <p>
    Hãy gọi ngay hotline  
    <span className="text-red-600 text-lg">  039 393 4819</span>,
    đội ngũ của chúng tôi sẽ tư vấn chi tiết và cá nhân hóa mâm lễ phù hợp với yêu cầu của bạn.
  </p>
</div>

<div className="text-2xl py-2">
<h2>
              <strong>5. Thông Tin Liên Hệ Nhắc Nhớ Việt, Đồ Cúng Tận Tâm An Tâm Mọi Nhà</strong>
            </h2>
</div>
            
            <div className="text-lg py-2">
              <p>
                🌐 Website:{" "}
                <a
                  href="https://nhac-nho-viet-project-frontend.vercel.app"
                  className="text-vietnam-green hover:underline"
                >
                  nhacnhoviet.vn
                </a>
              </p>
              
              <p>
                📷 Fanpage Facebook:{" "}
                <a
                  href="https://www.facebook.com/profile.php?id=61582970296339"
                  className="text-vietnam-green hover:underline"
                >
                  Nhắc Nhớ Việt - Đồ Cúng Tận Tâm An Tâm Mọi Nhà
                </a>
              </p>
              <p>📩 Email: nhacnhoviet1@gmail.com</p>
              <p>📍 7 Đường D1, Long Thạnh Mỹ, Thủ Đức, Ho Chi Minh City, Vietnam</p>
              <p>☎️ Hotline: 039 393 4819 </p>
              <p>📞 Zalo: 039 393 4819</p>
           
            <p className = "text-lg py-2 mt-6"  >
              Nhắc Nhớ Việt, Đồ Cúng Tận Tâm An Tâm Mọi Nhà luôn sẵn sàng phục vụ quý khách 24/7
              và đáp ứng mọi nhu cầu về đồ lễ, đồ cúng cho mọi dịp từ lễ
              thần linh, gia tiên đến các nghi lễ quan trọng khác.
            </p>
          </div>
           </div>

          {/* Plugin Facebook */}
          {/* <div className="mt-6">
            <iframe
              loading="lazy"
              src="//www.facebook.com/plugins/like.php?href=https://andole.vn/gioi-thieu-an-do-le-do-cung-tan-tam-n149787.html&layout=button_count&action=like&show_faces=false&share=true&appId="
              scrolling="no"
              frameBorder="0"
              style={{
                border: "none",
                overflow: "hidden",
                width: "145px",
                height: "20px",
              }}
              allowTransparency
              title="Facebook Like Button"
            ></iframe>
          </div> */}
        </div>
      </div>
</div>
  );
};

export default Information;
