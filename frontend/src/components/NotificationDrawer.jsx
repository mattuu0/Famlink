import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import "./NotificationDrawer.css";
import TimeRangeSlider from "./TimeRangeSlider";
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
  const [respondedSchedules, setRespondedSchedules] = useState(() => {
    // localStorageから送信済みスケジュールIDを取得
    const stored = localStorage.getItem('respondedSchedules');
    return stored ? JSON.parse(stored) : [];
  });
  // 時間調整モードの管理
  const [adjustmentMode, setAdjustmentMode] = useState({});
  // 調整された時間範囲の管理
  const [adjustedTimeSlots, setAdjustedTimeSlots] = useState({});

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
    const isCurrentlySelected = selectedTimeSlots[key];

    // 選択状態を切り替え
    setSelectedTimeSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // クリックで選択した時は自動的に調整モードにする
    if (!isCurrentlySelected) {
      setAdjustmentMode((prev) => ({
        ...prev,
        [key]: true,
      }));
    }
  };

  const handleTimeRangeChange = (notificationId, dateIndex, slotIndex, { startTime, endTime }) => {
    const key = `${notificationId}__${dateIndex}__${slotIndex}`;
    setAdjustedTimeSlots((prev) => ({
      ...prev,
      [key]: { startTime, endTime },
    }));
  };

  const handleRespondNoAvailability = async (notificationId) => {
    // 「行ける日がない」で送信
    const email = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!window.confirm("全ての日程が都合悪いことを送信しますか？")) {
      return;
    }

    try {
      const userResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${email}`,
      );
      const userData = await userResponse.json();

      const scheduleId = notificationId.replace("schedule-", "");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/schedules/${scheduleId}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            user_name: userData.user_name,
            selected_time_slots: [],
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();

        // 送信済みスケジュールに追加
        const newRespondedSchedules = [...respondedSchedules, scheduleId];
        setRespondedSchedules(newRespondedSchedules);
        localStorage.setItem('respondedSchedules', JSON.stringify(newRespondedSchedules));

        if (result.isComplete) {
          alert("回答を送信しました！\n全員の回答が揃いました！");
        } else {
          alert("回答を送信しました！");
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

      // 調整された時間範囲があればそれを使用、なければ元の時間を使用
      const adjustedTime = adjustedTimeSlots[key];
      const slot = date.timeSlots[slotIdx];

      return {
        date: date.date,
        startTime: adjustedTime ? adjustedTime.startTime : slot.startTime,
        endTime: adjustedTime ? adjustedTime.endTime : slot.endTime,
      };
    });

    // ユーザー情報を取得
    const email = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    try {
      const userResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${email}`,
      );
      const userData = await userResponse.json();

      // スケジュールIDを抽出（notificationIdは "schedule-123" の形式）
      const scheduleId = notificationId.replace("schedule-", "");

      // 回答を送信
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/schedules/${scheduleId}/responses`,
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

        // 選択状態をクリア
        const clearedSlots = { ...selectedTimeSlots };
        const clearedAdjusted = { ...adjustedTimeSlots };
        const clearedMode = { ...adjustmentMode };
        Object.keys(clearedSlots).forEach((key) => {
          if (key.startsWith(notificationId)) {
            delete clearedSlots[key];
            delete clearedAdjusted[key];
            delete clearedMode[key];
          }
        });
        setSelectedTimeSlots(clearedSlots);
        setAdjustedTimeSlots(clearedAdjusted);
        setAdjustmentMode(clearedMode);

        // 送信済みスケジュールに追加
        const newRespondedSchedules = [...respondedSchedules, scheduleId];
        setRespondedSchedules(newRespondedSchedules);
        localStorage.setItem('respondedSchedules', JSON.stringify(newRespondedSchedules));

        if (result.isComplete) {
          alert("日程を送信しました！\n全員の回答が揃いました！");
        } else {
          alert("日程を送信しました！");
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

  const handleSelectFinalSlot = async (notificationId, slot) => {
    const userId = localStorage.getItem("userId");
    const scheduleId = notificationId.replace("schedule-", "");

    if (!window.confirm(`この日程で決定しますか？\n${slot.date} ${slot.startTime} 〜 ${slot.endTime}`)) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/schedules/${scheduleId}/select`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selected_slot: slot,
            user_id: userId,
          }),
        },
      );

      if (response.ok) {
        alert("日程を確定しました！");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("確定に失敗しました: " + errorData.message);
      }
    } catch (error) {
      console.error("日程確定エラー:", error);
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

      // 送信済みかチェック（notificationIdは "schedule-123" の形式）
      const scheduleId = notification.id.replace('schedule-', '');
      const isResponded = respondedSchedules.includes(scheduleId);

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
                            const slotKey = `${notification.id}__${dateIndex}__${slotIndex}`;
                            const isSelected = selectedTimeSlots[slotKey];
                            const isAdjustMode = adjustmentMode[slotKey];
                            const adjustedTime = adjustedTimeSlots[slotKey];

                            // 表示する時間（調整済みがあればそれを、なければ元の時間）
                            const displayTime = adjustedTime || timeSlot;

                            return (
                              <div key={slotIndex} style={{ marginBottom: "8px" }}>
                                {!isAdjustMode ? (
                                  <button
                                    className={`time-slot-button ${isSelected ? "selected" : ""}`}
                                    onClick={() =>
                                      !isResponded && toggleTimeSlot(
                                        notification.id,
                                        dateIndex,
                                        slotIndex,
                                      )
                                    }
                                    disabled={isResponded}
                                    style={{
                                      borderColor: isSelected
                                        ? "#a52a44"
                                        : "#e0e0e0",
                                      backgroundColor: isSelected
                                        ? "#a52a44"
                                        : "#ffffff",
                                      color: isSelected ? "#ffffff" : "#424242",
                                      cursor: isResponded ? "not-allowed" : "pointer",
                                      opacity: isResponded ? 0.6 : 1,
                                    }}
                                  >
                                    <span className="time-slot-icon">
                                      {isSelected ? "✓" : "○"}
                                    </span>
                                    {formatTimeSlot(displayTime)}
                                  </button>
                                ) : (
                                  <div>
                                    <TimeRangeSlider
                                      originalStart={timeSlot.startTime}
                                      originalEnd={timeSlot.endTime}
                                      onRangeChange={(range) =>
                                        handleTimeRangeChange(
                                          notification.id,
                                          dateIndex,
                                          slotIndex,
                                          range,
                                        )
                                      }
                                      disabled={isResponded}
                                    />
                                    {!isResponded && (
                                      <button
                                        onClick={() => {
                                          const key = `${notification.id}__${dateIndex}__${slotIndex}`;
                                          setAdjustmentMode((prev) => ({
                                            ...prev,
                                            [key]: false,
                                          }));
                                        }}
                                        style={{
                                          width: "100%",
                                          padding: "6px 12px",
                                          fontSize: "13px",
                                          backgroundColor: "#f0f0f0",
                                          color: "#424242",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          marginTop: "4px",
                                        }}
                                      >
                                        ✓ 時間を確定
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ),
                  )}
                  <button
                    className={`respond-button ${hasSelection && !isResponded ? "active" : ""}`}
                    onClick={() => handleRespond(notification.id)}
                    disabled={!hasSelection || isResponded}
                    style={{
                      backgroundColor: isResponded ? "#999999" : (hasSelection ? "#a52a44" : "#cccccc"),
                      color: "#ffffff",
                    }}
                  >
                    {isResponded
                      ? "送信済み ✓"
                      : (hasSelection
                        ? "選択した日程で返信"
                        : "日程を選択してください")}
                  </button>
                  {!isResponded && (
                    <button
                      className="respond-button no-availability-button"
                      onClick={() => handleRespondNoAvailability(notification.id)}
                      style={{
                        backgroundColor: "#6c757d",
                        color: "#ffffff",
                        marginTop: "8px",
                      }}
                    >
                      行ける日がない
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      );
    }

    if (notification.type === "pendingSelection") {
      return (
        <div
          key={notification.id}
          className={`notification-item meeting-request ${!notification.isRead ? "unread" : ""}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`,
          }}
        >
          <div className="notification-emoji-icon">🎯</div>
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">{notification.title}</p>
              <span className="notification-time">{timeAgo}</span>
            </div>

            <div className="notification-section">
              <p className="notification-label">💬 会いたい内容</p>
              <div className="purpose-text">{notification.data.purpose}</div>
            </div>

            {notification.data.commonSlots &&
              notification.data.commonSlots.length > 0 && (
                <div className="notification-section">
                  <p className="notification-label">
                    📆 全員が都合の良い時間帯（以下から1つ選択してください）
                  </p>
                  {notification.data.commonSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      className="time-slot-button selectable"
                      onClick={() => handleSelectFinalSlot(notification.id, slot)}
                      style={{
                        borderColor: "#a52a44",
                        backgroundColor: "#ffffff",
                        color: "#424242",
                        marginBottom: "8px",
                        width: "100%",
                      }}
                    >
                      <span className="time-slot-icon">📅</span>
                      {slot.date} {slot.startTime} 〜 {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>
      );
    }

    if (notification.type === "scheduleFinal") {
      const isAutoDecided = notification.data.autoDecided;
      const noCommonTime = notification.data.noCommonTime;

      return (
        <div
          key={notification.id}
          className={`notification-item meeting-request ${!notification.isRead ? "unread" : ""}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`,
          }}
        >
          <div className="notification-emoji-icon">
            {isAutoDecided ? "🎉" : noCommonTime ? "😢" : "✅"}
          </div>
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">{notification.title}</p>
              <span className="notification-time">{timeAgo}</span>
            </div>

            <div className="notification-section">
              <p className="notification-label">💬 会いたい内容</p>
              <div className="purpose-text">{notification.data.purpose}</div>
            </div>

            {isAutoDecided && notification.data.finalSchedule?.selectedSlot && (
              <div className="notification-section">
                <p className="notification-label">📆 決定した日程</p>
                <div className="time-slot-display" style={{ borderLeftColor: "#a52a44" }}>
                  📅 {notification.data.finalSchedule.selectedSlot.date}{" "}
                  {notification.data.finalSchedule.selectedSlot.startTime} 〜{" "}
                  {notification.data.finalSchedule.selectedSlot.endTime}
                </div>
              </div>
            )}

            {!isAutoDecided && notification.data.finalSchedule &&
              notification.data.finalSchedule.length > 0 && (
                <div className="notification-section">
                  <p className="notification-label">
                    {noCommonTime ? "📆 みんなの回答" : "📆 みんなが選んだ日程"}
                  </p>
                  {notification.data.finalSchedule.map((response, idx) => (
                    <div key={idx}>
                      <p className="user-name-display">
                        👤 {response.user_name}さん
                      </p>
                      {response.slots && response.slots.length > 0 ? (
                        response.slots.map((slot, slotIdx) => (
                          <div key={slotIdx} className="time-slot-display">
                            📅 {slot.date} {slot.startTime} 〜 {slot.endTime}
                          </div>
                        ))
                      ) : (
                        <div className="time-slot-display" style={{ borderLeftColor: "#6c757d" }}>
                          ❌ 行ける日がない
                        </div>
                      )}
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
