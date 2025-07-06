import React from "react";

export default function Home({ onLoginClick }) {
  return (
    <div className="main-wrapper">
      <header className="header">
        <span className="header-title">CAZABET</span>
      </header>
      {/* لو عندك سلايدر صور هنا */}
      {/* <div className="slider-holder"><img src="..." className="slider-img" alt="" /></div> */}
      <div className="grid-container grid-3">
        <div className="grid-item">
          <div className="icon-holder">
            <span role="img" aria-label="مباريات">⚽️</span>
          </div>
          <div className="title">المباريات</div>
        </div>
        <div className="grid-item">
          <div className="icon-holder">
            <span role="img" aria-label="أخبار">📰</span>
          </div>
          <div className="title">الأخبار</div>
        </div>
        <div className="grid-item" onClick={onLoginClick} style={{ background: "#155081" }}>
          <div className="icon-holder">
            <span role="img" aria-label="دخول">🔑</span>
          </div>
          <div className="title">تسجيل الدخول</div>
        </div>
        {/* أضف مربعات أخرى حسب رغبتك */}
      </div>
      {/* يمكنك إضافة الفوتر أو البوتوم ناف هنا */}
    </div>
  );
}
