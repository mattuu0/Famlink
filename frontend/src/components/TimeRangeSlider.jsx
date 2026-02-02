import React, { useState, useRef } from 'react';
import './TimeRangeSlider.css';

/**
 * 時間帯調整スライダーコンポーネント
 * 開始時間と終了時間をスライダーで調整
 */
const TimeRangeSlider = ({
  originalStart,
  originalEnd,
  onRangeChange,
  disabled = false
}) => {
  // 時間を分に変換
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 分を時間に変換（HH:MM形式）
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const minTime = timeToMinutes(originalStart);
  const maxTime = timeToMinutes(originalEnd);
  const step = 30; // 30分刻み

  const [timeRange, setTimeRange] = useState([minTime, maxTime]);
  const [dragging, setDragging] = useState(null);
  const sliderRef = useRef(null);

  const getPositionFromValue = (value) => {
    return ((value - minTime) / (maxTime - minTime)) * 100;
  };

  const getValueFromPosition = (clientX) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (clientX - rect.left) / rect.width;
    const value = minTime + percent * (maxTime - minTime);
    // 30分刻みに丸める
    const rounded = Math.round(value / step) * step;
    return Math.max(minTime, Math.min(maxTime, rounded));
  };

  const handleMouseDown = (e, handle) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(handle);
  };

  const handleMouseMove = (e) => {
    if (!dragging || disabled) return;

    const newValue = getValueFromPosition(e.clientX);
    let newRange = [...timeRange];

    if (dragging === 'start') {
      if (newValue < timeRange[1]) {
        newRange[0] = newValue;
      }
    } else if (dragging === 'end') {
      if (newValue > timeRange[0]) {
        newRange[1] = newValue;
      }
    }

    setTimeRange(newRange);
    onRangeChange({
      startTime: minutesToTime(newRange[0]),
      endTime: minutesToTime(newRange[1])
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  React.useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, timeRange]);

  const startPos = getPositionFromValue(timeRange[0]);
  const endPos = getPositionFromValue(timeRange[1]);

  return (
    <div className="time-range-slider">
      <div className="time-display">
        <span className="time-label">🕐</span>
        <span className="time-value">{minutesToTime(timeRange[0])}</span>
        <span className="time-separator">〜</span>
        <span className="time-value">{minutesToTime(timeRange[1])}</span>
      </div>

      <div
        ref={sliderRef}
        className={`slider-container ${disabled ? 'disabled' : ''}`}
      >
        <div className="slider-track-bg" />
        <div
          className="slider-track-active"
          style={{
            left: `${startPos}%`,
            width: `${endPos - startPos}%`
          }}
        />
        <div
          className="slider-handle start-handle"
          style={{ left: `${startPos}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        />
        <div
          className="slider-handle end-handle"
          style={{ left: `${endPos}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
        />
      </div>

      <div className="slider-labels">
        <span>{originalStart}</span>
        <span>{originalEnd}</span>
      </div>
    </div>
  );
};

export default TimeRangeSlider;
