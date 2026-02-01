import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConfirmationPage.css";

/**
 * ConfirmationPage (確認画面)
 * 役割: 選択した内容を確認して送信する画面
 */
const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から渡されたデータを取得
  const { timeRanges, meetupType } = location.state || {};

  /**
   * 戻るボタンがクリックされたときの処理
   */
  const handleBack = () => {
    navigate(-1); // 前のページに戻る
  };

  /**
   * 送信ボタンがクリックされたときの処理
   */
  const handleSubmit = async () => {
    console.log("送信データ:", { timeRanges, meetupType });

    const email = localStorage.getItem('authToken');
    const familyId = localStorage.getItem('familyId');

    if (!email || !familyId) {
      alert("ユーザー情報が不足しています。再度ログインしてください。");
      return;
    }

    try {
      // ユーザー名を取得するために API を叩く
      const userResponse = await fetch(`http://127.0.0.1:3001/api/users/${email}`);
      const userData = await userResponse.json();
      const senderName = userData.user_name || email.split('@')[0];
      const senderId = userData.id;

      // スケジュールを保存
      const response = await fetch('http://127.0.0.1:3001/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_id: familyId,
          sender_name: senderName,
          meetup_type: meetupType,
          time_ranges: timeRanges,
          sender_id: senderId
        })
      });

      if (response.ok) {
        console.log("スケジュール保存成功");
        // 送信完了画面に遷移
        navigate("/complete");
      } else {
        const errorData = await response.json();
        alert("送信に失敗しました: " + (errorData.message || "サーバーエラー"));
      }
    } catch (error) {
      console.error("送信エラー:", error);
      alert("サーバーに接続できませんでした。");
    }
  };

  /**
   * 会いたい内容のアイコンを取得
   */
  const getMeetupTypeDisplay = () => {
    const types = {
      meal: { text: "ご飯を食べたい", emoji: "🍽️" },
      tea: { text: "おしゃべりしたい", emoji: "☕" },
      house: { text: "顔を見たい", emoji: "🏠" },
      others: { text: "その他", emoji: "💭" },
    };
    return types[meetupType] || types.others;
  };

  return (
    <div className="confirmation-container">
      {/* 戻るボタン */}
      <button className="back-button" onClick={handleBack}>
        ←
      </button>

      {/* タイトルエリア */}
      <div className="confirmation-header">
        <h1 className="confirmation-title">確認画面</h1>
        <p className="confirmation-subtitle">
          以下の内容で送信してよろしいですか？
        </p>
      </div>

      {/* 確認内容エリア */}
      <div className="confirmation-content">
        {/* 会いたい内容 */}
        {meetupType && (
          <div className="confirmation-section">
            <h3 className="section-title">📝 会いたい内容</h3>
            <div className="meetup-type-display">
              <span className="meetup-emoji">
                {getMeetupTypeDisplay().emoji}
              </span>
              <span className="meetup-text">
                {getMeetupTypeDisplay().text}
              </span>
            </div>
          </div>
        )}

        {/* 希望日時 */}
        <div className="confirmation-section">
          <h3 className="section-title">📅 希望日時</h3>
          {timeRanges && timeRanges.length > 0 ? (
            <div className="time-ranges-list">
              {timeRanges.map((item, index) => (
                <div key={index} className="time-range-item">
                  <div className="date-label">{item.date}</div>
                  <div className="ranges-wrapper">
                    {item.ranges.map((range, idx) => (
                      <div key={idx} className="time-range-display">
                        <span className="time-start">{range.start}</span>
                        <span className="time-separator">〜</span>
                        <span className="time-end">{range.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">日時が選択されていません</p>
          )}
        </div>

        {/* 注意事項 */}
        <div className="confirmation-notice">
          <div className="notice-icon">ⓘ</div>
          <div className="notice-content">
            <p className="notice-title">送信前の確認事項</p>
            <ul className="notice-list">
              <li>選択した日時で相手に通知が送信されます</li>
              <li>相手が確認後、調整が行われます</li>
              <li>送信後の変更は相手に再度通知されます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="button-area">
        <button className="confirmation-edit-button" onClick={handleBack}>
          内容を修正する
        </button>
        <button className="confirmation-submit-button" onClick={handleSubmit}>
          この内容で送信
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;