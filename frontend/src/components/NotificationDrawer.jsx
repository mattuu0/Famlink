import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import "./NotificationDrawer.css";
import scheduleIcon from "../assets/calendar.png";
import happyIcon from "../assets/happy.png";
import sadIcon from "../assets/sad.png";
import angryIcon from "../assets/angry.png";
import funIcon from "../assets/fun.png";
import normalIcon from "../assets/normal.png";

const emotionIcons = {
  嬉しい: happyIcon,
  悲しい: sadIcon,
  怒り: angryIcon,
  楽しい: funIcon,
  普通: normalIcon,
};

const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications: externalNotifications,
}) => {
  const notifications = externalNotifications;
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});

  const getEmotionIcon = (emotion) => {
    return emotionIcons[emotion] || normalIcon;
  };

  const formatTimeSlot = (timeSlot) => {
    return `${timeSlot.startTime} 〜 ${timeSlot.endTime}`;
  };

  const getSenderColor = (sender) => {
    const colors = {
      mother: { bg: "#fff0f3", border: "#ffb3c1", accent: "#ff6b9d" },
      father: { bg: "#f0fff4", border: "#b3efc1", accent: "#52c97a" },
      aoi: { bg: "#fff9f0", border: "#ffd6a5", accent: "#ff9a3c" },
    };
    return (
      colors[sender] || { bg: "#f9f9f9", border: "#e0e0e0", accent: "#999" }
    );
  };

  const toggleTimeSlot = (notificationId, dateIndex, slotIndex) => {
    const key = `${notificationId}__${dateIndex}__${slotIndex}`;
    setSelectedTimeSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRespond = async (notificationId) => {
    const selected = Object.keys(selectedTimeSlots).filter(
      (key) => key.startsWith(notificationId) && selectedTimeSlots[key],
    );

    if (selected.length === 0) {
      return;
    }

    // 選択した日程を整形
    const notification = notifications.find((n) => n.id === notificationId);
    const selectedSlots = selected.map((key) => {
      const parts = key.split("__");
      const dateIdx = parts[parts.length - 2];
      const slotIdx = parts[parts.length - 1];
      const date = notification.data.preferredDates[dateIdx];
      const slot = date.timeSlots[slotIdx];
      return {
        date: date.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    });

    // ユーザー情報を取得
    const email = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    try {
      const userResponse = await fetch(
        `http://127.0.0.1:3001/api/users/${email}`,
      );
      const userData = await userResponse.json();

      // スケジュールIDを抽出（notificationIdは "schedule-123" の形式）
      const scheduleId = notificationId.replace("schedule-", "");

      // 回答を送信
      const response = await fetch(
        `http://127.0.0.1:3001/api/schedules/${scheduleId}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            user_name: userData.user_name,
            selected_time_slots: selectedSlots,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert("日程を送信しました！");

        // 選択状態をクリア
        const clearedSlots = { ...selectedTimeSlots };
        Object.keys(clearedSlots).forEach((key) => {
          if (key.startsWith(notificationId)) {
            delete clearedSlots[key];
          }
        });
        setSelectedTimeSlots(clearedSlots);

        if (result.isComplete) {
          alert("全員の回答が揃いました！送信者に通知されます。");
        }
      } else {
        const errorData = await response.json();
        alert("送信に失敗しました: " + errorData.message);
      }
    } catch (error) {
      console.error("回答送信エラー:", error);
      alert("サーバーに接続できませんでした");
    }
  };

  const renderNotificationItem = (notification) => {
    const timeAgo = formatDistanceToNow(notification.createdAt, {
      addSuffix: true,
      locale: ja,
    });
    const senderColors = getSenderColor(notification.sender);

    if (notification.type === "emotion") {
      return (
        <div
          key={notification.id}
          className={`notification-item ${!notification.isRead ? "unread" : ""}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`,
          }}
        >
          <img
            src={getEmotionIcon(notification.data.mood)}
            alt={notification.data.mood}
            className="notification-icon"
          />
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">{notification.title}</p>
              <span className="notification-time">{timeAgo}</span>
            </div>
            <p className="notification-body">
              {notification.data.comment &&
              notification.data.comment !== notification.data.mood
                ? `「${notification.data.comment}」`
                : `「${notification.data.mood}」`}
            </p>
          </div>
        </div>
      );
    }

    if (notification.type === "meetingRequest") {
      const hasSelection = Object.keys(selectedTimeSlots).some(
        (key) => key.startsWith(notification.id) && selectedTimeSlots[key],
      );

      return (
        <div
          key={notification.id}
          className={`notification-item meeting-request ${!notification.isRead ? "unread" : ""}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`,
          }}
        >
          <div className="notification-emoji-icon">📅</div>
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">{notification.title}</p>
              <span className="notification-time">{timeAgo}</span>
            </div>

            {notification.data.purpose && (
              <div className="notification-section">
                <p className="notification-label">💬 会いたい内容</p>
                <div className="purpose-text">{notification.data.purpose}</div>
              </div>
            )}

            {notification.data.preferredDates &&
              notification.data.preferredDates.length > 0 && (
                <div className="notification-section">
                  <p className="notification-label">
                    📆 希望日時を選択してください
                  </p>
                  {notification.data.preferredDates.map(
                    (dateSlot, dateIndex) => (
                      <div key={dateIndex} className="date-slot-wrapper">
                        <p className="date-header">{dateSlot.date}</p>
                        {dateSlot.timeSlots &&
                          dateSlot.timeSlots.map((timeSlot, slotIndex) => {
                            const slotKey = `${notification.id}-${dateIndex}-${slotIndex}`;
                            const isSelected = selectedTimeSlots[slotKey];
                            return (
                              <button
                                key={slotIndex}
                                className={`time-slot-button ${isSelected ? "selected" : ""}`}
                                onClick={() =>
                                  toggleTimeSlot(
                                    notification.id,
                                    dateIndex,
                                    slotIndex,
                                  )
                                }
                                style={{
                                  borderColor: isSelected
                                    ? "#a52a44"
                                    : "#e0e0e0",
                                  backgroundColor: isSelected
                                    ? "#a52a44"
                                    : "#ffffff",
                                  color: isSelected ? "#ffffff" : "#424242",
                                }}
                              >
                                <span className="time-slot-icon">
                                  {isSelected ? "✓" : "○"}
                                </span>
                                {formatTimeSlot(timeSlot)}
                              </button>
                            );
                          })}
                      </div>
                    ),
                  )}
                  <button
                    className={`respond-button ${hasSelection ? "active" : ""}`}
                    onClick={() => handleRespond(notification.id)}
                    disabled={!hasSelection}
                    style={{
                      backgroundColor: hasSelection ? "#a52a44" : "#cccccc",
                      color: "#ffffff",
                    }}
                  >
                    {hasSelection
                      ? "選択した日程で返信"
                      : "日程を選択してください"}
                  </button>
                </div>
              )}
          </div>
        </div>
      );
    }

    if (notification.type === "scheduleFinal") {
      return (
        <div
          key={notification.id}
          className={`notification-item meeting-request ${!notification.isRead ? "unread" : ""}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`,
          }}
        >
          <div className="notification-emoji-icon">✅</div>
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">{notification.title}</p>
              <span className="notification-time">{timeAgo}</span>
            </div>

            <div className="notification-section">
              <p className="notification-label">💬 会いたい内容</p>
              <div className="purpose-text">{notification.data.purpose}</div>
            </div>

            {notification.data.finalSchedule &&
              notification.data.finalSchedule.length > 0 && (
                <div className="notification-section">
                  <p className="notification-label">📆 みんなが選んだ日程</p>
                  {notification.data.finalSchedule.map((response, idx) => (
                    <div key={idx}>
                      <p className="user-name-display">
                        👤 {response.user_name}さん
                      </p>
                      {response.slots &&
                        response.slots.map((slot, slotIdx) => (
                          <div key={slotIdx} className="time-slot-display">
                            📅 {slot.date} {slot.startTime} 〜 {slot.endTime}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={`notification-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      ></div>
      <div className={`notification-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>通知</h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        <div className="drawer-body">
          {notifications.length > 0 ? (
            notifications.map(renderNotificationItem)
          ) : (
            <p className="no-notifications">通知はまだありません。</p>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
