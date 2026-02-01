import React, {useState, useEffect, useMemo} from "react";
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
import useNotificationStore from "../stores/notificationStore";
import NotificationDrawer from "../components/NotificationDrawer";

const HomePage = ({onLogout}) => {
  const emotions = [
    {id: "fun", name: "楽しい", image: funImage, color: "#B39DDB"},
    {id: "sad", name: "悲しい", image: sadImage, color: "#90CAF9"},
    {id: "normal", name: "普通", image: normalImage, color: "#A5D6A7"},
    {id: "angry", name: "怒り", image: angryImage, color: "#EF9A9A"},
    {id: "happy", name: "嬉しい", image: happyImage, color: "#FFF59D"},
  ];

  const [selectedIndex, setSelectedIndex] = useState(2);
  const [comment, setComment] = useState("普通");
  const [isSent, setIsSent] = useState(false);

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications,
  );

  const [showMenu, setShowMenu] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;
    const initializeData = async () => {
      const email = localStorage.getItem("authToken");
      if (!email) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:3001/api/users/${email}`,
        );
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          // user_idをlocalStorageに保存
          if (data.id) {
            localStorage.setItem('userId', data.id);
          }
          if (data.family_id) {
            fetchNotifications();
            intervalId = setInterval(fetchNotifications, 5000);
          }
        }
      } catch (error) {
        console.error("初期化失敗:", error);
      }
    };
    initializeData();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const familyHistory = useMemo(() => {
    const colorPalette = [
      "#a52a44",
      "#B39DDB",
      "#90CAF9",
      "#A5D6A7",
      "#EF9A9A",
      "#FFF59D",
    ];

    const emotionNotifications = notifications.filter(
      (n) => n.type === "emotion",
    );

    const uniqueUserIds = [
      ...new Set(
        emotionNotifications.map(
          (n) => n.data?.user_id || n.data?.user_name || "不明",
        ),
      ),
    ].sort();

    const userColorMap = {};
    uniqueUserIds.forEach((id, index) => {
      userColorMap[id] = colorPalette[index % colorPalette.length];
    });

    return emotionNotifications.map((n) => {
      const name = n.data?.user_name || "不明";
      const colorKey = n.data?.user_id || name;
      const timeAgo = Math.floor(
        (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60),
      );

      return {
        name,
        emotion: n.data?.emotion || n.data?.mood || "不明",
        comment: n.data?.comment,
        timeAgo: timeAgo > 0 ? `約${timeAgo}時間前` : "たった今",
        color: userColorMap[colorKey],
      };
    });
  }, [notifications]);

  const handleSliderChange = (e) => {
    setSelectedIndex(parseInt(e.target.value));
    setIsSent(false);
  };

  const handleSliderEnd = (e) => {
    setComment(emotions[parseInt(e.target.value)].name);
  };

  const handleSubmit = async () => {
    console.log("userData:", userData);
    console.log("userData.family_id", userData.family_id);
    if (!userData || !userData.family_id)
      return alert("家族グループに参加していません");
    const selectedEmotion = emotions[selectedIndex];
    const postData = {
      user_name: userData.user_name || "自分",
      mood: selectedEmotion.name,
      comment: comment,
      family_id: userData.family_id,
      user_id: userData.id,
    };
    try {
      const response = await fetch("http://127.0.0.1:3001/api/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        setIsSent(true);
        fetchNotifications();
        setTimeout(() => {
          setIsSent(false);
          setComment(emotions[selectedIndex].name);
        }, 3000);
      } else {
        throw new Error("Server response was not ok.");
      }
    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。");
    }
  };

  const handleMeetRequest = () => navigate("/meetup");

  const getMeetupTypeText = (type) =>
    ({
      meal: "ご飯を食べたい",
      tea: "おしゃべりしたい",
      house: "顔を見たい",
      others: "会いたい",
    })[type] || "会いたい";

  const handleNotification = () => setIsDrawerOpen(!isDrawerOpen);

  const handleLogoutAndLeave = async () => {
    if (
      !window.confirm(
        "ログアウトすると家族グループからも脱退します。\nよろしいですか？",
      )
    )
      return;
    const email = localStorage.getItem("authToken");
    if (email) {
      try {
        await fetch("http://127.0.0.1:3001/api/families/leave", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email}),
        });
      } catch (error) {
        console.error("脱退処理エラー:", error);
      } finally {
        localStorage.removeItem("familyId");
      }
    }
    onLogout();
  };

  const handleInviteFamily = () => {
    if (userData?.family_id) {
      navigator.clipboard.writeText(userData.family_id);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } else {
      alert("招待コードを取得できませんでした。");
    }
  };

  return (
    <div className="home-container">
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={handleNotification}
        notifications={notifications}
      />
      <div className="top-right-controls">
        <button className="notification-button" onClick={handleNotification}>
          <img src={bellImage} alt="通知" className="notification-image" />
          {unreadCount > 0 && (
            <span className="notification-dot">{unreadCount}</span>
          )}
        </button>
        <div className="settings-menu-container">
          <button
            className="settings-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⚙️
          </button>
          {showMenu && (
            <div className="settings-dropdown">
              <button onClick={handleLogoutAndLeave}>
                ログアウト（家族脱退）
              </button>
              <button onClick={handleInviteFamily}>
                {inviteCopied ? "コピーしました！" : "家族を招待"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="emotion-container">
        <h2 className="emotion-title">今どんな気持ち？</h2>
        <div className="slider-container">
          <div className="emotions-display">
            {emotions.map((emotion, index) => (
              <div
                key={emotion.id}
                className={`emotion-item ${index === selectedIndex ? "selected" : ""}`}
              >
                <img
                  src={emotion.image}
                  alt={emotion.name}
                  className="emotion-image"
                />
              </div>
            ))}
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={selectedIndex}
            onChange={handleSliderChange}
            onMouseUp={handleSliderEnd}
            onTouchEnd={handleSliderEnd}
            className="slider-input"
            style={{
              background: `linear-gradient(to right, #a52a44 0%, #a52a44 ${(selectedIndex / 4) * 100}%, #e0e0e0 ${(selectedIndex / 4) * 100}%, #e0e0e0 100%)`,
            }}
          />
        </div>
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

      <button
        className={`submit-button-outer ${isSent ? "sent" : ""}`}
        onClick={handleSubmit}
      >
        {isSent ? (
          <>
            送信完了<span className="checkmark">✓</span>
          </>
        ) : (
          <>
            送信
            <img src={sendImage} alt="送る" className="send-button-icon" />
          </>
        )}
      </button>

      <div className="family-history">
        <h2 className="history-title">最近の家族の様子</h2>
        <div className="history-items">
          {familyHistory.length > 0 ? (
            familyHistory.map((entry, index) => (
              <div key={index} className="history-item-card">
                <span
                  className="history-dot"
                  style={{backgroundColor: entry.color}}
                ></span>
                <span className="history-content">
                  <strong>{entry.name}</strong>：{entry.emotion}
                </span>
                <span className="history-time-badge">（{entry.timeAgo}）</span>
              </div>
            ))
          ) : (
            <p className="no-history">まだ家族の様子がありません</p>
          )}
        </div>
      </div>

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
