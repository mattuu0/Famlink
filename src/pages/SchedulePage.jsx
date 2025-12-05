import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SchedulePage.css";

/**
 * SchedulePage (日程調整画面)
 * 役割: 会いたい日時を選択する画面
 */
const SchedulePage = () => {
  const navigate = useNavigate();

  // 現在の日付を取得
  const today = new Date();
  
  // 日付直接指定の状態
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  
  // 時間直接指定の状態
  const [selectedStartHour, setSelectedStartHour] = useState("--");
  const [selectedStartMinute, setSelectedStartMinute] = useState("--");
  const [selectedEndHour, setSelectedEndHour] = useState("--");
  const [selectedEndMinute, setSelectedEndMinute] = useState("--");

  // カレンダー表示用の状態
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  
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
   * カレンダーの日付セルを生成
   */
  const generateCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    const days = [];

    // 空白セル
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 日付セル
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  /**
   * カレンダーの時間スロットを生成（9:00-23:00、30分刻み）
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
  const getDayOfWeek = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return days[date.getDay()];
  };

  /**
   * 時間スロットが選択されているか確認
   */
  const isTimeSlotSelected = (year, month, day, hour, minute) => {
    return selectedTimeSlots.some(
      slot =>
        slot.year === year &&
        slot.month === month &&
        slot.day === day &&
        slot.hour === hour &&
        slot.minute === minute
    );
  };

  /**
   * カレンダーから時間スロットを選択/解除
   */
  const handleTimeSlotClick = (day, hour, minute) => {
    if (!day) return;

    const slot = {
      year: calendarYear,
      month: calendarMonth,
      day: day,
      hour: hour,
      minute: minute,
    };

    // 既に選択されている場合は解除
    const isSelected = isTimeSlotSelected(calendarYear, calendarMonth, day, hour, minute);
    
    if (isSelected) {
      setSelectedTimeSlots(prev =>
        prev.filter(
          s =>
            !(
              s.year === slot.year &&
              s.month === slot.month &&
              s.day === slot.day &&
              s.hour === slot.hour &&
              s.minute === slot.minute
            )
        )
      );
    } else {
      // 新規選択
      setSelectedTimeSlots(prev => [...prev, slot]);
    }

    // 直接指定も更新（最初の選択のみ）
    if (selectedTimeSlots.length === 0 && !isSelected) {
      setSelectedYear(calendarYear);
      setSelectedMonth(calendarMonth);
      setSelectedDay(day);
      setSelectedStartHour(hour.toString());
      setSelectedStartMinute(minute.toString());
    }
  };

  /**
   * 選択された時間スロットを時間範囲にグループ化
   * 例: [{date: "2025/12/1", ranges: [{start: "13:00", end: "16:30"}]}]
   */
  const getGroupedTimeRanges = () => {
    if (selectedTimeSlots.length === 0) return [];

    // 日付でグループ化
    const grouped = {};
    selectedTimeSlots.forEach(slot => {
      const dateKey = `${slot.year}/${slot.month}/${slot.day}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // 各日付の時間をソートして連続する範囲にまとめる
    const result = [];
    Object.keys(grouped).forEach(dateKey => {
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
          ranges.push({
            start: formatTime(rangeStart.hour, rangeStart.minute),
            end: formatTime(rangeEnd.hour, rangeEnd.minute + 30), // 終了時刻は+30分
          });
          rangeStart = curr;
          rangeEnd = curr;
        }
      }

      // 最後の範囲を追加
      ranges.push({
        start: formatTime(rangeStart.hour, rangeStart.minute),
        end: formatTime(rangeEnd.hour, rangeEnd.minute + 30),
      });

      result.push({ date: dateKey, ranges });
    });

    return result;
  };

  /**
   * 直接指定の変更をカレンダーに同期
   */
  const handleDirectDateChange = (year, month, day) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    
    // カレンダー表示も同期
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  /**
   * カレンダーの月を変更
   */
  const changeCalendarMonth = (direction) => {
    let newMonth = calendarMonth + direction;
    let newYear = calendarYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  /**
   * 選択が完了しているか確認
   */
  const isSelectionComplete = () => {
    return selectedTimeSlots.length > 0;
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
      const groupedRanges = getGroupedTimeRanges();
      console.log("選択された日時:", groupedRanges);
      
      // 次の画面に遷移（確認画面などに遷移する想定）
      navigate("/confirmation", { state: { timeRanges: groupedRanges } });
    }
  };

  return (
    <div className="schedule-container">
      {/* 戻るボタン */}
      <button className="back-button" onClick={handleBack}>
        ←
      </button>

      {/* インフォメーション */}
      <div className="schedule-info">
        <span className="info-icon">ⓘ</span>
        <p className="info-text">
          カレンダーを押して日付と時間の指定ができます。連続する時間や別日も選択できます。
        </p>
      </div>

      {/* 選択された時間範囲の表示 */}
      {selectedTimeSlots.length > 0 && (
        <div className="selected-ranges-display">
          <h4>選択中の日時：</h4>
          {getGroupedTimeRanges().map((item, index) => (
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
          {/* 日付を直接選択 */}
          <div className="selection-box">
            <h3 className="selection-title">📅 日付を直接選択</h3>
            <div className="date-selectors">
              <div className="selector-group">
                <select
                  className="date-select"
                  value={selectedYear}
                  onChange={(e) =>
                    handleDirectDateChange(
                      parseInt(e.target.value),
                      selectedMonth,
                      selectedDay
                    )
                  }
                >
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span className="selector-label">年</span>
              </div>

              <div className="selector-group">
                <select
                  className="date-select"
                  value={selectedMonth}
                  onChange={(e) =>
                    handleDirectDateChange(
                      selectedYear,
                      parseInt(e.target.value),
                      selectedDay
                    )
                  }
                >
                  {generateMonthOptions().map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <span className="selector-label">月</span>
              </div>

              <div className="selector-group">
                <select
                  className="date-select"
                  value={selectedDay}
                  onChange={(e) =>
                    handleDirectDateChange(
                      selectedYear,
                      selectedMonth,
                      parseInt(e.target.value)
                    )
                  }
                >
                  {generateDayOptions().map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <span className="selector-label">日</span>
              </div>

              <div className="day-of-week">
                {getDayOfWeek(selectedYear, selectedMonth, selectedDay)}曜日
              </div>
            </div>
            <p className="note-text">日付の入力は必須です</p>
            <p className="sub-note-text">
              ※カレンダーから時間枠を選択すると自動で終了時刻も入力されます
            </p>
          </div>

          {/* 時間を直接選択 */}
          <div className="selection-box">
            <h3 className="selection-title">⏰ 時間を直接選択</h3>
            <div className="time-selectors">
              <div className="selector-group">
                <select
                  className="time-select"
                  value={selectedStartHour}
                  onChange={(e) => setSelectedStartHour(e.target.value)}
                >
                  <option value="--">--</option>
                  {generateHourOptions().map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="selector-label">時</span>
              </div>

              <div className="selector-group">
                <select
                  className="time-select"
                  value={selectedStartMinute}
                  onChange={(e) => setSelectedStartMinute(e.target.value)}
                >
                  <option value="--">--</option>
                  {generateMinuteOptions().map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="selector-label">分</span>
              </div>

              <span className="time-separator">〜</span>

              <div className="selector-group">
                <select
                  className="time-select"
                  value={selectedEndHour}
                  onChange={(e) => setSelectedEndHour(e.target.value)}
                >
                  <option value="--">--</option>
                  {generateHourOptions().map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="selector-label">時</span>
              </div>

              <div className="selector-group">
                <select
                  className="time-select"
                  value={selectedEndMinute}
                  onChange={(e) => setSelectedEndMinute(e.target.value)}
                >
                  <option value="--">--</option>
                  {generateMinuteOptions().map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="selector-label">分</span>
              </div>
            </div>
            <p className="note-text error">カレンダーから選択すると自動入力されます</p>
            <p className="sub-note-text">
              ※予約可能時間: 1か月後までの月曜～日曜 9:00 - 23:00
            </p>
          </div>
        </div>

        {/* 右側: カレンダーから選択 */}
        <div className="calendar-selection-panel">
          <div className="calendar-box">
            <div className="calendar-header">
              <h3 className="calendar-title">📅 カレンダーから日時選択</h3>
              <div className="calendar-navigation">
                <button
                  className="nav-button"
                  onClick={() => changeCalendarMonth(-1)}
                >
                  前の週
                </button>
                <span className="current-period">
                  {calendarYear}年{calendarMonth}月
                </span>
                <button
                  className="nav-button"
                  onClick={() => changeCalendarMonth(1)}
                >
                  次の週
                </button>
              </div>
            </div>

            <div className="calendar-instructions">
              <p>30分枠をクリックで選択。連続する時間や別日も選択できます。</p>
              <p>選択した枠をもう一度クリックすると解除できます。</p>
            </div>

            {/* カレンダーグリッド */}
            <div className="calendar-grid">
              {/* 曜日ヘッダー */}
              <div className="calendar-row header-row">
                <div className="time-header"></div>
                {generateCalendarDays()
                  .filter((day) => day !== null)
                  .slice(0, 7)
                  .map((day, index) => (
                    <div key={index} className="day-header">
                      <div className="day-date">
                        {calendarMonth}/{day}
                        <span className="day-name">
                          ({getDayOfWeek(calendarYear, calendarMonth, day)})
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* 時間スロット */}
              {generateTimeSlots().map((slot, slotIndex) => (
                <div key={slotIndex} className="calendar-row">
                  <div className="time-label">
                    {formatTime(slot.hour, slot.minute)}
                  </div>
                  {generateCalendarDays()
                    .filter((day) => day !== null)
                    .slice(0, 7)
                    .map((day, dayIndex) => (
                      <button
                        key={dayIndex}
                        className={`time-slot ${
                          isTimeSlotSelected(calendarYear, calendarMonth, day, slot.hour, slot.minute)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleTimeSlotClick(day, slot.hour, slot.minute)}
                      >
                        {isTimeSlotSelected(calendarYear, calendarMonth, day, slot.hour, slot.minute)
                          ? "選択中"
                          : "選択"}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        className={`submit-button ${isSelectionComplete() ? "active" : ""}`}
        onClick={handleSubmit}
        disabled={!isSelectionComplete()}
      >
        送信
      </button>
    </div>
  );
};

export default SchedulePage;