import { useMemo } from 'react';
import type { Availability } from '../types';
import './Calendar.css';

interface CalendarProps {
  availability: Availability[];
  onDayClick: (date: string) => void;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export function Calendar({ availability, onDayClick, currentDate, onMonthChange }: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, Availability>();
    availability.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [availability]);

  const goToPreviousMonth = (): void => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const goToNextMonth = (): void => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const getStatusClass = (date: string): string => {
    const item = availabilityMap.get(date);
    if (!item) return '';
    return `status-${item.status}`;
  };

  const getStatusNote = (date: string): string | null => {
    const item = availabilityMap.get(date);
    return item?.note || null;
  };

  const renderDays = (): JSX.Element[] => {
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const statusClass = getStatusClass(dateStr);
      const note = getStatusNote(dateStr);

      days.push(
        <div
          key={day}
          className={`calendar-day ${statusClass}`}
          onClick={() => onDayClick(dateStr)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onDayClick(dateStr);
            }
          }}
        >
          <span className="day-number">{day}</span>
          {note && <span className="day-note">{note}</span>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
          &lt;
        </button>
        <h2 className="calendar-month">{monthName}</h2>
        <button className="calendar-nav-btn" onClick={goToNextMonth}>
          &gt;
        </button>
      </div>
      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="calendar-grid">{renderDays()}</div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color unavailable" />
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <span className="legend-color partial" />
          <span>Partial</span>
        </div>
      </div>
    </div>
  );
}
