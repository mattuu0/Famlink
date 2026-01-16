import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
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
const HomePage = ({ onLogout }) => {
  // 感情の定義（5つの感情）
  const emotions = [
    {id: "fun", name: "楽しい", image: funImage, color: "#B39DDB"}, // くすみパステル紫
    {id: "sad", name: "悲しい", image: sadImage, color: "#90CAF9"}, // くすみパステル青
    {id: "normal", name: "普通", image: normalImage, color: "#A5D6A7"}, // くすみパステル緑
    {id: "angry", name: "怒り", image: angryImage, color: "#EF9A9A"}, // くすみパステル赤
    {id: "happy", name: "嬉しい", image: happyImage, color: "#FFF59D"}, // くすみパステル黄
  ];

  // 現在選択されている感情のインデックス（デフォルトは真ん中の normal = 普通）
  const [selectedIndex, setSelectedIndex] = useState(2);

  // コメント入力（デフォルトは「普通」）
  const [comment, setComment] = useState("普通");

  // 送信完了状態
  const [isSent, setIsSent] = useState(false);

  // 通知の有無
  const [hasNotification, setHasNotification] = useState(true);

  // 設定メニューの表示状態
  const [showMenu, setShowMenu] = useState(false);

  // スライダーがドラッグ中かどうかの状態
  const [isDragging, setIsDragging] = useState(false);

  // 最近の家族の様子
  const [familyHistory, setFamilyHistory] = useState([]);

  // 家族からの要望
  const [schedules, setSchedules] = useState([]);

  // ユーザー情報の状態
  const [userData, setUserData] = useState(null);

  // バックエンドからデータを取ってくる関数
  const fetchFamilyHistory = async (familyId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/messages/${familyId}`);
      const data = await response.json();
      
      // 固定カラーパレット（元の赤色を先頭に、あとの5色はくすみパステル）
      const colorPalette = [
        "#a52a44", // 1番目：メインの赤色
        "#B39DDB", // 2番目：くすみパステル紫
        "#90CAF9", // 3番目 : くすみパステル青
        "#A5D6A7", // 4番目 : くすみパステル緑
        "#EF9A9A", // 5番目 : くすみパステル赤
        "#FFF59D"  // 6番目 : くすみパステル黄
      ];
      
      const uniqueNames = [...new Set(data.map(msg => msg.user_name || "不明"))].sort();
      const userColorMap = {};
      uniqueNames.forEach((name, index) => {
        userColorMap[name] = colorPalette[index % colorPalette.length];
      });

      const formattedData = data.map((msg) => {
        const name = msg.user_name || "不明";
        return {
          name: name,
          emotion: msg.emotion,
          comment: msg.comment,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: userColorMap[name],
        };
      });

      // 新着チェック：件数が増えていたら通知ドットをつける
      setFamilyHistory(prev => {
        if (prev.length > 0 && formattedData.length > prev.length) {
          setHasNotification(true);
        }
        return formattedData;
      });
    } catch (error) {
      console.error("データ取得失敗:", error);
    }
  };

  // スケジュール（要望）を取得する関数
  const fetchSchedules = async (familyId) => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/schedules/${familyId}`);
      if (response.ok) {
        const data = await response.json();
        
        // 新着チェック
        setSchedules(prev => {
          if (prev.length > 0 && data.length > prev.length) {
            setHasNotification(true);
          }
          return data;
        });
      }
    } catch (error) {
      console.error("スケジュール取得失敗:", error);
    }
  };

  // 画面が開いた時に実行 & ポーリング設定
  useEffect(() => {
    let intervalId;

    const initializeData = async () => {
      const email = localStorage.getItem('authToken');
      if (!email) return;

      try {
        const response = await fetch(`http://127.0.0.1:3001/api/users/${email}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          
          if (data.family_id) {
            // 初回読み込み
            fetchFamilyHistory(data.family_id);
            fetchSchedules(data.family_id);

            // 5秒おきに自動更新（リアルタイム通知用）
            intervalId = setInterval(() => {
              fetchFamilyHistory(data.family_id);
              fetchSchedules(data.family_id);
            }, 5000);
          }
        }
      } catch (error) {
        console.error("初期化失敗:", error);
      }
    };

    initializeData();

    // クリーンアップ
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  /**
   * スライダーの値が変更されたときの処理
   * 感情に応じてコメントを自動更新
   */
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedIndex(value);
    setIsSent(false);
  };

  /**
   * スライダーのドラッグ開始（マウス・タッチ両対応）
   */
  const handleSliderStart = () => {
    setIsDragging(true);
  };

  /**
   * スライダーのドラッグ終了（マウス・タッチ両対応）
   * ドラッグ終了時にコメントを更新
   */
  const handleSliderEnd = (e) => {
    setIsDragging(false);
    const value = parseInt(e.target.value);
    const selectedEmotion = emotions[value];
    setComment(selectedEmotion.name);
  };

  /**
   * 送信ボタンがクリックされたときの処理
   */
  const handleSubmit = async () => {
    if (!userData || !userData.family_id) {
      alert("家族グループに参加していません");
      return;
    }

    const selectedEmotion = emotions[selectedIndex];

    // 送信するデータ
    const postData = {
      user_name: userData.user_name || "自分",
      emotion: selectedEmotion.name,
      comment: comment,
      family_id: userData.family_id,
    };

    try {
      // ★バックエンドにデータを送る
      const response = await fetch("http://127.0.0.1:3001/api/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setIsSent(true);
        // ★送信に成功したら、リストを再読み込みする
        fetchFamilyHistory(userData.family_id);

        setTimeout(() => {
          setIsSent(false);
          setComment(emotions[selectedIndex].name);
        }, 3000);
      }
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。サーバーが動いているか確認してね！");
    }
  };

  /**
   * 会いたいボタンがクリックされたときの処理
   */
  const navigate = useNavigate();

  const handleMeetRequest = () => {
    navigate("/meetup");
  };

  /**
   * 会いたい要望の表示用テキスト
   */
  const getMeetupTypeText = (type) => {
    const types = {
      meal: "ご飯を食べたい",
      tea: "おしゃべりしたい",
      house: "顔を見たい",
      others: "会いたい"
    };
    return types[type] || "会いたい";
  };

  /**
   * 通知ボタンがクリックされたときの処理
   */
  const handleNotification = () => {
    console.log("通知ボタンがクリックされました");
    setHasNotification(false);
  };

  /**
   * ログアウトと同時に家族から脱退する処理
   */
  const handleLogoutAndLeave = async () => {
    // ユーザーへの確認
    if (!window.confirm("ログアウトすると家族グループからも脱退します。\nよろしいですか？")) {
      return;
    }

    const email = localStorage.getItem('authToken');
    if (email) {
      try {
        // 家族から脱退するAPIコール
        await fetch("http://127.0.0.1:3001/api/families/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        // 成功しても失敗しても、ローカルの家族IDは消しておく
        localStorage.removeItem("familyId");
      } catch (error) {
        console.error("脱退処理中にエラーが発生しましたが、ログアウトを続行します:", error);
      }
    }
    
    // 通常のログアウト処理（ローカルストレージのクリアと画面遷移）
    onLogout();
  };

  return (
    <div className="home-container">
      {/* 右上ボタンエリア */}
      <div className="top-right-controls">
        {/* 通知ボタン */}
        <button className="notification-button" onClick={handleNotification}>
          <img src={bellImage} alt="通知" className="notification-image" />
          {hasNotification && <span className="notification-dot"></span>}
        </button>

        {/* 設定ボタン */}
        <div className="settings-menu-container">
          <button className="settings-button" onClick={() => setShowMenu(!showMenu)}>
            ⚙️
          </button>
          {showMenu && (
            <div className="settings-dropdown">
              <button onClick={handleLogoutAndLeave}>ログアウト（家族脱退）</button>
            </div>
          )}
        </div>
      </div>

      {/* 感情選択エリア */}
      <div className="emotion-container">
        <h2 className="emotion-title">今どんな気持ち？</h2>

        <div className="slider-container">
          {/* 感情の表示（5つすべて表示） */}
          <div className="emotions-display">
            {[0, 1, 2, 3, 4].map((index) => {
              const emotion = emotions[index];
              return (
                <div
                  key={emotion.id}
                  className={`emotion-item ${
                    index === selectedIndex ? "selected" : ""
                  }`}
                >
                  <img
                    src={emotion.image}
                    alt={emotion.name}
                    className="emotion-image"
                  />
                </div>
              );
            })}
          </div>

          {/* スライダー - ドラッグ対応 */}
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={selectedIndex}
            onChange={handleSliderChange}
            onMouseDown={handleSliderStart}
            onMouseUp={handleSliderEnd}
            onTouchStart={handleSliderStart}
            onTouchEnd={handleSliderEnd}
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
            placeholder={emotions[selectedIndex].name}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
          />
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
          <>
            送信
            <img src={sendImage} alt="送る" className="send-button-icon" />
          </>
        )}
      </button>

      {/* 家族からの要望セクション */}
      {schedules.length > 0 && (
        <div className="schedules-container">
          <h2 className="history-title">家族からの会いたい要望</h2>
          <div className="schedules-list">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="schedule-card" onClick={() => navigate("/confirmation", { state: { meetupType: schedule.meetup_type, timeRanges: JSON.parse(schedule.time_ranges), readOnly: true } })}>
                <div className="schedule-card-content">
                  <span className="schedule-sender"><strong>{schedule.sender_name}</strong>さんから</span>
                  <span className="schedule-type">「{getMeetupTypeText(schedule.meetup_type)}」の要望が届いています</span>
                </div>
                <div className="schedule-arrow">＞</div>
              </div>
            ))}
          </div>
        </div>
      )}
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
                {entry.comment &&
                  entry.comment !== entry.emotion &&
                  ` : ${entry.comment}`}
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
