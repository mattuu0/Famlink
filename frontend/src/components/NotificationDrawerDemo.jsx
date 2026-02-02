import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import './NotificationDrawerDemo.css';
import scheduleIcon from '../assets/calendar.png';
import happyIcon from '../assets/happy.png';
import sadIcon from '../assets/sad.png';
import angryIcon from '../assets/angry.png';
import funIcon from '../assets/fun.png';
import normalIcon from '../assets/normal.png';

// Sample notification data
const sampleNotifications = [
  {
    id: '1',
    type: 'emotion',
    title: 'お母さんの気持ち',
    data: {
      mood: '嬉しい',
      comment: 'うれしい'
    },
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1時間前
    isRead: false,
    sender: 'mother'
  },
  {
    id: '2',
    type: 'emotion',
    title: 'お父さんの気持ち',
    data: {
      mood: '悲しい',
      comment: '悲しい'
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3時間前
    isRead: false,
    sender: 'father'
  },
  {
    id: '3',
    type: 'meetingRequest',
    title: 'あおいさんから会いたいリクエスト',
    data: {
      purpose: 'おしゃべりしたい',
      preferredDates: [
        {
          date: '2026/1/19',
          timeSlots: [{ startTime: '09:00', endTime: '15:00' }]
        },
        {
          date: '2026/1/30',
          timeSlots: [{ startTime: '17:30', endTime: '21:30' }]
        }
      ],
      requesterName: 'あおい'
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分前
    isRead: false,
    sender: 'aoi'
  }
];

const emotionIcons = {
  '嬉しい': happyIcon,
  '悲しい': sadIcon,
  '怒り': angryIcon,
  '楽しい': funIcon,
  '普通': normalIcon,
};

const NotificationDrawerDemo = ({ isOpen, onClose, notifications: externalNotifications }) => {
  const [notifications] = useState(externalNotifications || sampleNotifications);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});

  const getEmotionIcon = (emotion) => {
    return emotionIcons[emotion] || normalIcon;
  };

  const formatTimeSlot = (timeSlot) => {
    return `${timeSlot.startTime} 〜 ${timeSlot.endTime}`;
  };

  const getSenderColor = (sender) => {
    const colors = {
      mother: { bg: '#fff0f3', border: '#ffb3c1', accent: '#ff6b9d' },
      father: { bg: '#f0fff4', border: '#b3efc1', accent: '#52c97a' },
      aoi: { bg: '#fff9f0', border: '#ffd6a5', accent: '#ff9a3c' }
    };
    return colors[sender] || { bg: '#f9f9f9', border: '#e0e0e0', accent: '#999' };
  };

  const toggleTimeSlot = (notificationId, dateIndex, slotIndex) => {
    const key = `${notificationId}-${dateIndex}-${slotIndex}`;
    setSelectedTimeSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRespond = (notificationId) => {
    const selected = Object.keys(selectedTimeSlots).filter(key => 
      key.startsWith(notificationId) && selectedTimeSlots[key]
    );
    if (selected.length > 0) {
      alert(`選択した日程:\n${selected.map(key => {
        const [, dateIdx, slotIdx] = key.split('-');
        const notification = notifications.find(n => n.id === notificationId);
        const date = notification.data.preferredDates[dateIdx];
        const slot = date.timeSlots[slotIdx];
        return `${date.date} ${formatTimeSlot(slot)}`;
      }).join('\n')}`);
    }
  };

  const renderNotificationItem = (notification) => {
    const timeAgo = formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ja });
    const senderColors = getSenderColor(notification.sender);

    if (notification.type === 'emotion') {
      return (
        <div 
          key={notification.id} 
          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`
          }}
        >
          <img src={getEmotionIcon(notification.data.mood)} alt={notification.data.mood} className="notification-icon" />
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">
                {notification.title}
              </p>
              <span className="notification-time">{timeAgo}</span>
            </div>
            <p className="notification-body">
              {notification.data.comment && notification.data.comment !== notification.data.mood 
                ? `「${notification.data.comment}」` 
                : `「${notification.data.mood}」`}
            </p>
          </div>
        </div>
      );
    }

    if (notification.type === 'meetingRequest') {
      const hasSelection = Object.keys(selectedTimeSlots).some(key => 
        key.startsWith(notification.id) && selectedTimeSlots[key]
      );

      return (
        <div 
          key={notification.id} 
          className={`notification-item meeting-request ${!notification.isRead ? 'unread' : ''}`}
          style={{
            borderTop: `1px solid ${senderColors.accent}`
          }}
        >
          <div className="notification-emoji-icon">📅</div>
          <div className="notification-content">
            <div className="notification-header">
              <p className="notification-title">
                {notification.title}
              </p>
              <span className="notification-time">{timeAgo}</span>
            </div>
            
            {notification.data.purpose && (
              <div className="notification-section">
                <p className="notification-label">💬 会いたい内容</p>
                <div className="purpose-text">
                  {notification.data.purpose}
                </div>
              </div>
            )}

            {notification.data.preferredDates && notification.data.preferredDates.length > 0 && (
              <div className="notification-section">
                <p className="notification-label">📆 希望日時を選択してください</p>
                {notification.data.preferredDates.map((dateSlot, dateIndex) => (
                  <div key={dateIndex} className="date-slot-wrapper">
                    <p className="date-header">
                      {dateSlot.date}
                    </p>
                    {dateSlot.timeSlots && dateSlot.timeSlots.map((timeSlot, slotIndex) => {
                      const slotKey = `${notification.id}-${dateIndex}-${slotIndex}`;
                      const isSelected = selectedTimeSlots[slotKey];
                      return (
                        <button
                          key={slotIndex}
                          className={`time-slot-button ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleTimeSlot(notification.id, dateIndex, slotIndex)}
                          style={{
                            borderColor: isSelected ? '#a52a44' : '#e0e0e0',
                            backgroundColor: isSelected ? '#a52a44' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#424242'
                          }}
                        >
                          <span className="time-slot-icon">{isSelected ? '✓' : '○'}</span>
                          {formatTimeSlot(timeSlot)}
                        </button>
                      );
                    })}
                  </div>
                ))}
                <button 
                  className={`respond-button ${hasSelection ? 'active' : ''}`}
                  onClick={() => handleRespond(notification.id)}
                  disabled={!hasSelection}
                  style={{
                    backgroundColor: hasSelection ? '#a52a44' : '#cccccc',
                    color: '#ffffff'
                  }}
                >
                  {hasSelection ? '選択した日程で返信' : '日程を選択してください'}
                </button>
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
      <div className={`notification-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`notification-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>通知</h2>
          <button onClick={onClose} className="close-button">×</button>
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

export default NotificationDrawerDemo;