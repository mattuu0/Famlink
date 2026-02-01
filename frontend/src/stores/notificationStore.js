import {create} from "zustand";

const getMeetupTypeText = (type) => {
  const types = {
    meal: "ご飯を食べたい",
    tea: "おしゃべりしたい",
    house: "顔を見たい",
    others: "会いたい",
  };
  return types[type] || "会いたい";
};

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    const familyId = localStorage.getItem("familyId");
    if (!familyId) {
      return;
    }

    if (get().loading) {
      return;
    }

    set({loading: true});

    try {
      const cacheBuster = `_=${new Date().getTime()}`;
      const scheduleApiUrl = `http://127.0.0.1:3001/api/schedules/${familyId}?${cacheBuster}`;
      const messageApiUrl = `http://127.0.0.1:3001/api/messages/${familyId}?${cacheBuster}`;

      const [scheduleRes, messageRes] = await Promise.all([
        fetch(scheduleApiUrl),
        fetch(messageApiUrl),
      ]);

      if (!scheduleRes.ok || !messageRes.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const schedules = await scheduleRes.json();
      const messages = await messageRes.json();

      console.log(schedules);

      // 現在のユーザーIDを取得
      const currentUserId = localStorage.getItem('userId');

      // スケジュール通知を作成
      const scheduleNotifications = schedules
        .filter((schedule) => {
          // 完了したスケジュールは送信者にも表示、それ以外は自分が送ったものを除外
          if (schedule.status === 'completed' && String(schedule.sender_id) === String(currentUserId)) {
            return true; // 完了した自分のスケジュールは表示
          }
          return String(schedule.sender_id) !== String(currentUserId); // 他人のスケジュールは表示
        })
        .map((schedule) => {
          // time_rangesをパース（JSON文字列の場合）
          let timeRanges = schedule.time_ranges;
          if (typeof timeRanges === "string") {
            try {
              timeRanges = JSON.parse(timeRanges);
            } catch (e) {
              console.error("JSON parse error:", e);
              timeRanges = [];
            }
          }

          // 完了したスケジュールの場合
          if (schedule.status === 'completed' && String(schedule.sender_id) === String(currentUserId)) {
            let finalSchedule = schedule.final_schedule;
            if (typeof finalSchedule === "string") {
              try {
                finalSchedule = JSON.parse(finalSchedule);
              } catch (e) {
                console.error("JSON parse error:", e);
                finalSchedule = [];
              }
            }

            return {
              id: `schedule-final-${schedule.id}`,
              type: "scheduleFinal",
              title: `日程が決まりました！`,
              data: {
                purpose: getMeetupTypeText(schedule.meetup_type),
                finalSchedule: finalSchedule,
                requesterName: schedule.sender_name,
              },
              createdAt: new Date(schedule.created_at),
              isRead: schedule.is_read || false,
              sender: schedule.sender_name,
            };
          }

          // 通常のスケジュール（回答待ち）
          return {
            id: `schedule-${schedule.id}`,
            type: "meetingRequest",
            title: `${schedule.sender_name}さんから会う提案`,
            data: {
              purpose: getMeetupTypeText(schedule.meetup_type),
              preferredDates: timeRanges.map((timeRange) => ({
                date: timeRange.date,
                timeSlots: timeRange.ranges.map((range) => ({
                  startTime: range.start,
                  endTime: range.end,
                })),
              })),
              requesterName: schedule.sender_name,
            },
            createdAt: new Date(schedule.created_at),
            isRead: schedule.is_read || false,
            sender: schedule.sender_name,
          };
        });

      // 自分が送ったメッセージを除外
      const messageNotifications = messages
        .filter((message) => String(message.user_id) !== String(currentUserId))
        .map((message) => ({
          id: `message-${message.id}`,
          type: "emotion",
          title: `${message.user_name}さんの今の気持ち`,
          content: `「${message.emotion}」`,
          createdAt: new Date(message.created_at),
          isRead: message.is_read || false,
          data: {
            user_id: message.user_id,
            user_name: message.user_name,
            mood: message.emotion,
            emotion: message.emotion,
            comment: message.comment,
          },
        }));

      const allNotifications = [
        ...scheduleNotifications,
        ...messageNotifications,
      ].sort((a, b) => b.createdAt - a.createdAt);

      const unreadCount = allNotifications.filter((n) => !n.isRead).length;

      const currentState = get();
      const currentIds = new Set(currentState.notifications.map((n) => n.id));
      const newIds = new Set(allNotifications.map((n) => n.id));

      const idsChanged =
        currentIds.size !== newIds.size ||
        [...currentIds].some((id) => !newIds.has(id));
      const unreadCountChanged = currentState.unreadCount !== unreadCount;

      if (idsChanged || unreadCountChanged) {
        set({
          notifications: allNotifications,
          unreadCount: unreadCount,
          loading: false,
        });
      } else {
        set({loading: false});
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({loading: false});
    }
  },
}));

export default useNotificationStore;
