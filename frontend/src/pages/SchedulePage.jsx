import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SchedulePage.css";

/**
 * SchedulePage (日程調整画面)
 * 役割: 会いたい日時を選択する画面
 */
const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から渡されたデータを取得
  const { meetupType } = location.state || {};

  // 現在の日付を取得
  const today = new Date();

  // スマホでは3日表示、PCでは7日表示
  const [daysToShow, setDaysToShow] = useState(window.innerWidth <= 768 ? 3 : 7);

  React.useEffect(() => {
    const handleResize = () => {
      setDaysToShow(window.innerWidth <= 768 ? 3 : 7);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 日付直接指定の状態
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // 時間直接指定の状態
  const [selectedStartHour, setSelectedStartHour] = useState("--");
  const [selectedStartMinute, setSelectedStartMinute] = useState("--");
  const [selectedEndHour, setSelectedEndHour] = useState("--");
  const [selectedEndMinute, setSelectedEndMinute] = useState("--");

  // 直接入力で保存された日程リスト
  const [savedDirectRanges, setSavedDirectRanges] = useState([]);

  // 編集中のインデックス（-1なら新規作成）
  const [editingIndex, setEditingIndex] = useState(-1);

  // カレンダー表示用の状態
  const getStartOfWeek = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = newDate.getDate() - day;
    return new Date(newDate.setDate(diff));
  };
  const [calendarStartDate, setCalendarStartDate] = useState(getStartOfWeek(today));

  // カレンダーから選択された時間スロットの配列
  // 形式: [{ year, month, day, hour, minute }, ...]
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  /**
   * 年の選択肢を生成（今年から5年後まで）
   */
  const generateYearOptions = () => {
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(today.getFullYear() + i);
    }
    return years;
  };

  /**
   * 月の選択肢を生成
   */
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  /**
   * 日の選択肢を生成
   */
  const generateDayOptions = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  /**
   * 時の選択肢を生成（0-23時）
   */
  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  /**
   * 分の選択肢を生成（0, 30）
   */
  const generateMinuteOptions = () => {
    return [0, 30];
  };

  /**
   * カレンダーの日付セルを生成（1週間分）
   */
  const generateCalendarDays = () => {
    const days = [];
    const startDate = new Date(calendarStartDate);
    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }
    return days;
  };

  /**
   * 時間スロットを生成（9:00-23:00、30分刻み）
   */
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 23 && minute === 30) break; // 23:00まで
        slots.push({ hour, minute });
      }
    }
    return slots;
  };

  /**
   * 時間を整形（例: 9:00）
   */
  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  /**
   * 曜日を取得
   */
  const getDayOfWeek = (date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return days[date.getDay()];
  };

  /**
   * 時間スロットが選択されているか確認
   */
  const isTimeSlotSelected = (date, hour, minute) => {
    return selectedTimeSlots.some((slot) => slot.year === date.getFullYear() && slot.month === date.getMonth() + 1 && slot.day === date.getDate() && slot.hour === hour && slot.minute === minute);
  };

  /**
   * カレンダーから時間スロットを選択/解除
   */
  const handleTimeSlotClick = (date, hour, minute) => {
    if (!date) return;

    const slot = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: hour,
      minute: minute,
    };

    // 既に選択されている場合は解除
    const isSelected = isTimeSlotSelected(date, hour, minute);

    if (isSelected) {
      setSelectedTimeSlots((prev) => prev.filter((s) => !(s.year === slot.year && s.month === slot.month && s.day === slot.day && s.hour === slot.hour && s.minute === slot.minute)));
    } else {
      // 新規選択
      setSelectedTimeSlots((prev) => [...prev, slot]);
    }
  };

  /**
   * 選択された時間スロットを時間範囲にグループ化
   */
  const getGroupedTimeRanges = () => {
    if (selectedTimeSlots.length === 0) return [];

    // 日付でグループ化
    const grouped = {};
    selectedTimeSlots.forEach((slot) => {
      const dateKey = `${slot.year}/${slot.month}/${slot.day}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // 各日付の時間をソートして連続する範囲にまとめる
    const result = [];
    Object.keys(grouped).forEach((dateKey) => {
      const slots = grouped[dateKey].sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return a.minute - b.minute;
      });

      const ranges = [];
      let rangeStart = slots[0];
      let rangeEnd = slots[0];

      for (let i = 1; i < slots.length; i++) {
        const prev = slots[i - 1];
        const curr = slots[i];

        // 連続しているかチェック（30分単位）
        const prevTime = prev.hour * 60 + prev.minute;
        const currTime = curr.hour * 60 + curr.minute;

        if (currTime - prevTime === 30) {
          // 連続している
          rangeEnd = curr;
        } else {
          // 連続していない：現在の範囲を確定して新しい範囲を開始
          const endTime = rangeEnd.hour * 60 + rangeEnd.minute + 30;
          const endHour = Math.floor(endTime / 60);
          const endMinute = endTime % 60;

          ranges.push({
            start: formatTime(rangeStart.hour, rangeStart.minute),
            end: formatTime(endHour, endMinute),
          });
          rangeStart = curr;
          rangeEnd = curr;
        }
      }

      // 最後の範囲を追加
      const endTime = rangeEnd.hour * 60 + rangeEnd.minute + 30;
      const endHour = Math.floor(endTime / 60);
      const endMinute = endTime % 60;

      ranges.push({
        start: formatTime(rangeStart.hour, rangeStart.minute),
        end: formatTime(endHour, endMinute),
      });

      result.push({ date: dateKey, ranges });
    });

    return result;
  };

  /**
   * 直接入力の日程を保存
   */
  const handleSaveDirectRange = () => {
    // 開始時間が未選択の場合は何もしない
    if (selectedStartHour === "--" || selectedStartMinute === "--") {
      alert("開始時間を選択してください");
      return;
    }

    const startTime = `${selectedStartHour.toString().padStart(2, "0")}:${selectedStartMinute.toString().padStart(2, "0")}`;
    const endTime = selectedEndHour !== "--" && selectedEndMinute !== "--" ? `${selectedEndHour.toString().padStart(2, "0")}:${selectedEndMinute.toString().padStart(2, "0")}` : "未指定";

    const newRange = {
      date: `${selectedYear}/${selectedMonth}/${selectedDay}`,
      ranges: [{ start: startTime, end: endTime }],
    };

    if (editingIndex >= 0) {
      // 編集モード：既存の日程を更新
      const updated = [...savedDirectRanges];
      updated[editingIndex] = newRange;
      setSavedDirectRanges(updated);
      setEditingIndex(-1);
    } else {
      // 新規追加
      setSavedDirectRanges((prev) => [...prev, newRange]);
    }

    // フォームをリセット
    resetDirectInputForm();
  };

  /**
   * 直接入力フォームをリセット
   */
  const resetDirectInputForm = () => {
    setSelectedStartHour("--");
    setSelectedStartMinute("--");
    setSelectedEndHour("--");
    setSelectedEndMinute("--");
  };

  /**
   * 保存された日程を編集
   */
  const handleEditDirectRange = (index) => {
    const range = savedDirectRanges[index];
    const [year, month, day] = range.date.split("/").map(Number);
    const [startHour, startMinute] = range.ranges[0].start.split(":").map(Number);

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    setSelectedStartHour(startHour.toString());
    setSelectedStartMinute(startMinute.toString());

    if (range.ranges[0].end !== "未指定") {
      const [endHour, endMinute] = range.ranges[0].end.split(":").map(Number);
      setSelectedEndHour(endHour.toString());
      setSelectedEndMinute(endMinute.toString());
    }

    setEditingIndex(index);

    // カレンダーも同期
    handleDirectDateChange(year, month, day);
  };

  /**
   * 保存された日程を削除
   */
  const handleDeleteDirectRange = (index) => {
    setSavedDirectRanges((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(-1);
      resetDirectInputForm();
    }
  };

  /**
   * 編集をキャンセル
   */
  const handleCancelEdit = () => {
    setEditingIndex(-1);
    resetDirectInputForm();
  };

  /**
   * 表示用の時間範囲を取得（カレンダー選択 + 直接入力の保存済み）
   */
  const getDisplayTimeRanges = () => {
    const result = [];

    // カレンダー選択を追加
    if (selectedTimeSlots.length > 0) {
      result.push(...getGroupedTimeRanges());
    }

    // 直接入力の保存済みを追加
    result.push(...savedDirectRanges);

    return result;
  };

  /**
   * 選択が完了しているか確認
   */
  const isSelectionComplete = () => {
    // カレンダー選択があるか、または直接入力の保存済みがあるか
    return selectedTimeSlots.length > 0 || savedDirectRanges.length > 0;
  };

  /**
   * 直接入力の保存ボタンが有効か確認
   */
  const canSaveDirectInput = () => {
    return selectedStartHour !== "--" && selectedStartMinute !== "--";
  };

  /**
   * 直接指定の変更をカレンダーに同期
   */
  const handleDirectDateChange = (year, month, day) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);

    // カレンダー表示も同期
    const newDate = new Date(year, month - 1, day);
    setCalendarStartDate(getStartOfWeek(newDate));
  };

  /**
   * カレンダーの週を変更
   */
  const changeCalendarWeek = (direction) => {
    const newStartDate = new Date(calendarStartDate);
    newStartDate.setDate(newStartDate.getDate() + daysToShow * direction);
    setCalendarStartDate(newStartDate);
  };

  /**
   * 戻るボタンがクリックされたときの処理
   */
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 送信ボタンがクリックされたときの処理
   */
  const handleSubmit = () => {
    if (isSelectionComplete()) {
      const timeRangesToSend = getDisplayTimeRanges();

      // 確認画面に遷移（選択内容を渡す）
      navigate("/confirmation", {
        state: {
          timeRanges: timeRangesToSend,
          meetupType: meetupType,
        },
      });
    }
  };

  return (
    <div className="schedule-container">
      {/* 戻るボタン */}
      <button className="back-button" onClick={handleBack}>
        <span style={{ fontSize: "36px" }}>←</span>
      </button>

      {/* インフォメーション */}
      <div className="schedule-info">
        <span className="info-icon">ⓘ</span>
        <p className="info-text">カレンダーを押して日付と時間の指定ができます。直接入力でも複数日程を選択できます。</p>
      </div>

      {/* 選択された時間範囲の表示 */}
      {getDisplayTimeRanges().length > 0 && (
        <div className="selected-ranges-display">
          <h4>選択中の日時：</h4>
          {getDisplayTimeRanges().map((item, index) => (
            <div key={index} className="range-item">
              <strong>{item.date}</strong>
              {item.ranges.map((range, idx) => (
                <span key={idx} className="time-range">
                  {range.start} ～ {range.end}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* メインコンテンツエリア */}
      <div className="schedule-content">
        {/* 左側: 日付・時間直接指定 */}
        <div className="direct-selection-panel">
          {/* 保存済み日程リスト */}
          {savedDirectRanges.length > 0 && (
            <div className="saved-ranges-box">
              <h3 className="selection-title">📝 保存済み日程</h3>
              <div className="saved-ranges-list">
                {savedDirectRanges.map((range, index) => (
                  <div key={index} className="saved-range-item">
                    <div className="saved-range-info">
                      <strong>{range.date}</strong>
                      <span>
                        {range.ranges[0].start} ～ {range.ranges[0].end}
                      </span>
                    </div>
                    <div className="saved-range-actions">
                      <button className="edit-button" onClick={() => handleEditDirectRange(index)}>
                        編集
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteDirectRange(index)}>
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 日付を直接選択 */}
          <div className="selection-box">
            <h3 className="selection-title">
              📅 日付を選択
              {editingIndex >= 0 && <span className="editing-badge">編集中</span>}
            </h3>
            <div className="date-selectors">
              <div className="selector-group">
                <select className="date-select" value={selectedYear} onChange={(e) => handleDirectDateChange(parseInt(e.target.value), selectedMonth, selectedDay)}>
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span className="selector-label">年</span>
              </div>

              <div className="selector-group">
                <select className="date-select" value={selectedMonth} onChange={(e) => handleDirectDateChange(selectedYear, parseInt(e.target.value), selectedDay)}>
                  {generateMonthOptions().map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <span className="selector-label">月</span>
              </div>

              <div className="selector-group">
                <select className="date-select" value={selectedDay} onChange={(e) => handleDirectDateChange(selectedYear, selectedMonth, parseInt(e.target.value))}>
                  {generateDayOptions().map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <span className="selector-label">日</span>
              </div>

              {/* <div className="day-of-week">
                {getDayOfWeek(new Date(selectedYear, selectedMonth - 1, selectedDay))}
              </div> */}
            </div>
          </div>

          {/* 時間を直接選択 */}
          <div className="selection-box">
            <h3 className="selection-title">⏰ 時間を選択</h3>
            <div className="time-selectors">
              {/* 開始時間 */}
              <div className="selector-group">
                <select className="time-select" value={selectedStartHour} onChange={(e) => setSelectedStartHour(e.target.value)}>
                  <option value="--">--</option>
                  {generateHourOptions().map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="selector-label">:</span>
              </div>

              <div className="selector-group">
                <select className="time-select" value={selectedStartMinute} onChange={(e) => setSelectedStartMinute(e.target.value)}>
                  <option value="--">--</option>
                  {generateMinuteOptions().map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              <span className="time-separator">〜</span>

              {/* 終了時間 */}
              <div className="selector-group">
                <select className="time-select" value={selectedEndHour} onChange={(e) => setSelectedEndHour(e.target.value)}>
                  <option value="--">--</option>
                  {generateHourOptions().map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="selector-label">:</span>
              </div>

              <div className="selector-group">
                <select className="time-select" value={selectedEndMinute} onChange={(e) => setSelectedEndMinute(e.target.value)}>
                  <option value="--">--</option>
                  {generateMinuteOptions().map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="save-button-container">
              <button className={`save-direct-button ${canSaveDirectInput() ? "active" : ""}`} onClick={handleSaveDirectRange} disabled={!canSaveDirectInput()}>
                {editingIndex >= 0 ? "更新" : "保存"}
              </button>
              {editingIndex >= 0 && (
                <button className="cancel-edit-button" onClick={handleCancelEdit}>
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 右側: カレンダーから選択 */}
        <div className="calendar-selection-panel">
          <div className="calendar-box">
            <div className="calendar-header">
              <h3 className="calendar-title">📅 カレンダーから選択</h3>
              <div className="calendar-navigation">
                <button className="nav-button" onClick={() => changeCalendarWeek(-1)}>
                  ◀ 前へ
                </button>
                <div className="current-period-wrapper">
                  <span className="current-period-text">
                    {calendarStartDate.getMonth() + 1}月{calendarStartDate.getDate()}日〜
                  </span>
                  <input
                    type="date"
                    className="current-period-input"
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      setCalendarStartDate(new Date(y, m - 1, d));
                      e.target.value = "";
                    }}
                  />
                </div>
                <button className="nav-button" onClick={() => changeCalendarWeek(1)}>
                  次へ ▶
                </button>
              </div>
            </div>

            {/* カレンダーグリッド（横スクロール可能） */}
            <div className="calendar-scroll-wrapper">
              <div className="calendar-grid">
                {/* 曜日ヘッダー */}
                <div className="calendar-row header-row">
                  <div className="time-header"></div>
                  {generateCalendarDays().map((date, index) => (
                    <div key={index} className="day-header">
                      <div className="day-date">
                        {date.getMonth() + 1}/{date.getDate()}
                        <span className="day-name">({getDayOfWeek(date)})</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 時間スロット */}
                {generateTimeSlots().map((slot, slotIndex) => (
                  <div key={slotIndex} className="calendar-row">
                    <div className="time-label">{formatTime(slot.hour, slot.minute)}</div>
                    {generateCalendarDays().map((date, dayIndex) => (
                      <button key={dayIndex} className={`time-slot ${isTimeSlotSelected(date, slot.hour, slot.minute) ? "selected" : ""}`} onClick={() => handleTimeSlotClick(date, slot.hour, slot.minute)}>
                        {isTimeSlotSelected(date, slot.hour, slot.minute) ? "✓" : ""}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <button className={`schedule-submit-button ${isSelectionComplete() ? "active" : ""}`} onClick={handleSubmit} disabled={!isSelectionComplete()}>
        送信
      </button>
    </div>
  );
};

export default SchedulePage;
