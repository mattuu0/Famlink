import React, {useState} from "react";
import "./HomePage.css";
import happyImage from "../assets/happy.png";
import sadImage from "../assets/sad.png";
import angryImage from "../assets/angry.png";
import normalImage from "../assets/normal.png";
import funImage from "../assets/fun.png";
import heartImage from "../assets/heartBotton.png";
import bellImage from "../assets/bell.png";
import sendImage from "../assets/send.png";

/**
 * HomePage (ホーム画面) PC版
 * 役割: ユーザーが今の感情を選択して家族に送信する画面
 */
const HomePage = () => {
  // 感情の定義（5つの感情）
  const emotions = [
    {id: "fun", name: "楽しい", image: funImage, color: "#9c27b0"},
    {id: "sad", name: "悲しい", image: sadImage, color: "#2196f3"},
    {id: "normal", name: "普通", image: normalImage, color: "#4caf50"},
    {id: "angry", name: "怒り", image: angryImage, color: "#f44336"},
    {id: "happy", name: "嬉しい", image: happyImage, color: "#ffc107"},
  ];

  // 現在選択されている感情のインデックス（デフォルトは真ん中の happy）
  const [selectedIndex, setSelectedIndex] = useState(2);

  // コメント入力
  const [comment, setComment] = useState("");

  // 送信完了状態
  const [isSent, setIsSent] = useState(false);

  // 通知の有無
  const [hasNotification, setHasNotification] = useState(true);

  // 最近の家族の様子（仮のデータ）
  const [familyHistory] = useState([
    {
      name: "お母さん",
      age: 74,
      emotion: "楽しい",
      time: "2時間前",
      color: "#4caf50",
    },
    {
      name: "お父さん",
      emotion: "sad bottom。",
      comment: "さみしい...",
      time: "2時間前",
      color: "#f44336",
    },
  ]);

  /**
   * スライダーの値が変更されたときの処理
   */
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedIndex(value);
    setIsSent(false);
  };

  /**
   * 送信ボタンがクリックされたときの処理
   */
  const handleSubmit = () => {
    const selectedEmotion = emotions[selectedIndex];
    console.log("送信:", {
      emotion: selectedEmotion.name,
      comment: comment,
    });

    setIsSent(true);

    setTimeout(() => {
      setIsSent(false);
      setComment("");
    }, 3000);
  };

  /**
   * 会いたいボタンがクリックされたときの処理
   */
  const handleMeetRequest = () => {
    console.log("会いたいボタンがクリックされました");
    alert("会いたいリクエストを送信しました！");
  };

  /**
   * 通知ボタンがクリックされたときの処理
   */
  const handleNotification = () => {
    console.log("通知ボタンがクリックされました");
    setHasNotification(false);
  };

  return (
    <div className="home-container">
      {/* 通知ボタン */}
      <button className="notification-button" onClick={handleNotification}>
        {/* 通知画像を使用する場合は下のコメントを外してください */}
        {<img src={bellImage} alt="通知" className="notification-image" />}
        {hasNotification && <span className="notification-dot"></span>}
      </button>

      {/* 感情選択エリア */}
      <div className="emotion-container">
        <h2 className="emotion-title">今どんな気持ち？</h2>

        <div className="slider-container">
          {/* 感情の表示（3つのみ表示） */}
          <div className="emotions-display">
            {[1, 2, 4].map((index) => {
              const emotion = emotions[index];
              return (
                <div
                  key={emotion.id}
                  className={`emotion-item ${
                    index === selectedIndex ? "selected" : ""
                  }`}
                >
                  {/* 画像を使用する場合は下のコメントを外してください */}
                  {
                    <img
                      src={emotion.image}
                      alt={emotion.name}
                      className="emotion-image"
                    />
                  }
                </div>
              );
            })}
          </div>

          {/* スライダー */}
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={selectedIndex}
            onChange={handleSliderChange}
            className="slider-input"
            style={{
              background: `linear-gradient(to right, #a52a44 0%, #a52a44 ${
                (selectedIndex / 4) * 100
              }%, #e0e0e0 ${(selectedIndex / 4) * 100}%, #e0e0e0 100%)`,
            }}
          />
        </div>

        {/* コメント入力 */}
        <div className="comment-section">
          <input
            type="text"
            placeholder="楽しい"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
          />
          <button
            className={`submit-icon ${isSent ? "sent" : ""}`}
            onClick={handleSubmit}
          >
            {isSent ? (
              <span className="checkmark">✓</span>
            ) : (
              <img src={sendImage} alt="送る" className="submit-icon-image" />
            )}
          </button>
        </div>
      </div>

      {/* 送信ボタン（枠の外） */}
      <button
        className={`submit-button-outer ${isSent ? "sent" : ""}`}
        onClick={handleSubmit}
      >
        {isSent ? (
          <>
            送信完了
            <span className="checkmark">✓</span>
          </>
        ) : (
          "送信"
        )}
      </button>

      {/* 最近の家族の様子 */}
      <div className="family-history">
        <h2 className="history-title">最近の家族の様子</h2>
        <ul className="history-list">
          {familyHistory.map((entry, index) => (
            <li key={index} className="history-item">
              <span
                className="history-dot"
                style={{backgroundColor: entry.color}}
              ></span>
              <span className="history-text">
                <strong>{entry.name}</strong>
                {entry.age && `: ${entry.age}`}
                {entry.emotion}
                {entry.comment && `${entry.comment}`}
                <span className="history-time">（{entry.time}）</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 会いたいボタン */}
      <div className="meet-button-container">
        <button className="meet-button" onClick={handleMeetRequest}>
          <img src={heartImage} alt="会いたい" className="heart-image" />
          <span className="meet-text">会いたい</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
