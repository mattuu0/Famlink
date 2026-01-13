import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompletePage.css";

/**
 * CompletePage (送信完了画面)
 * 役割: 送信が完了したことを表示する画面
 */
const CompletePage = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  // マウント時にアニメーション開始
  useEffect(() => {
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  }, []);

  /**
   * ホームに戻るボタンがクリックされたときの処理
   */
  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <div className="complete-container">
      <div className={`complete-content ${showContent ? "show" : ""}`}>
        {/* チェックマークアイコン */}
        <div className="complete-icon">
          <div className="checkmark-circle">
            <span className="checkmark">✓</span>
          </div>
        </div>

        {/* メッセージ */}
        <h1 className="complete-title">送信完了しました！</h1>
        <p className="complete-message">
          家族に通知が届きました。
          <br />
          相手の返信をお待ちください。
        </p>

        {/* アクションエリア */}
        <div className="complete-actions">
          <button className="home-button" onClick={handleBackToHome}>
            ホームに戻る
          </button>
        </div>

        {/* 補足メッセージ */}
        <div className="complete-info">
          <p className="info-text">
            相手が確認すると通知でお知らせします
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletePage;