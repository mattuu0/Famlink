import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MeetupPage.css";
import mealIcon from "../assets/meal.png";
import teaIcon from "../assets/tea.png";
import houseIcon from "../assets/house.png";
import othersIcon from "../assets/others.png";

/**
 * MeetupPage (会いたい画面)
 * 役割: どんな感じで会いたいかを選択する画面
 */
const MeetupPage = () => {
  const navigate = useNavigate();

  // 選択肢の定義
  const meetupOptions = [
    {
      id: "meal",
      title: "ご飯を食べたい",
      subtitle: "一緒に食事しませんか？",
      image: mealIcon,
      bgColor: "#f4d4d4",
    },
    {
      id: "tea",
      title: "おしゃべりしたい",
      subtitle: "ゆっくり話したいな",
      image: teaIcon,
      bgColor: "#d4efd4",
    },
    {
      id: "house",
      title: "顔を見たい",
      subtitle: "家でゆっくりしたいな",
      image: houseIcon,
      bgColor: "#d4e4f4",
    },
    {
      id: "others",
      title: "その他",
      subtitle: "会いたいです",
      image: othersIcon,
      bgColor: "#f4d4f4",
    },
  ];

  // 選択された項目のID
  const [selectedOption, setSelectedOption] = useState(null);

  /**
   * カードがクリックされたときの処理
   */
  const handleCardClick = (optionId) => {
    setSelectedOption(optionId);
  };

  /**
   * 戻るボタンがクリックされたときの処理
   */
  const handleBack = () => {
    navigate(-1); // 前のページに戻る
  };

  /**
   * 日程を選ぶボタンがクリックされたときの処理
   */
  const handleSubmit = () => {
    if (selectedOption) {
      console.log("選択された項目:", selectedOption);
      // 日程選択画面に遷移（選択内容を渡す）
      navigate("/schedule", { state: { meetupType: selectedOption } });
    }
  };

  return (
    <div className="meetup-container">
      {/* 戻るボタン */}
      <button className="back-button" onClick={handleBack}>
        <span style={{ fontSize: '48px' }}>←</span>
      </button>
      
      {/* タイトルエリア */}
      <div className="meetup-header">
        <h1 className="meetup-title">会いたい</h1>
        <p className="meetup-subtitle">どんな感じで会いたいですか？</p>
      </div>

      {/* 選択肢カードエリア */}
      <div className="options-grid">
        {meetupOptions.map((option) => (
          <button
            key={option.id}
            className={`option-card ${
              selectedOption === option.id ? "selected" : ""
            }`}
            style={{ backgroundColor: option.bgColor }}
            onClick={() => handleCardClick(option.id)}
          >
            {/* アイコン画像 */}
            <div className="option-icon">
              <img src={option.image} alt={option.title} />
            </div>
            {/* テキスト */}
            <h3 className="option-title">{option.title}</h3>
            <p className="option-subtitle">{option.subtitle}</p>
          </button>
        ))}
      </div>

      {/* 日程を選ぶボタン */}
      <button
        className={`submit-button ${selectedOption ? "active" : ""}`}
        onClick={handleSubmit}
        disabled={!selectedOption}
      >
        <span className="calendar-icon">📅</span>
        日程を選ぶ
      </button>
    </div>
  );
};

export default MeetupPage;