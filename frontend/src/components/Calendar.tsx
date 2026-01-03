import { useMemo } from 'react';
import type { Availability } from '../types';
import './Calendar.css';

interface CalendarProps {
  availability: Availability[];
  onDayClick: (date: string) => void;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  selectedDate?: string | null;
}

export function Calendar({ availability, onDayClick, currentDate, onMonthChange, selectedDate }: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
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

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    : '';

  const getStatusClass = (date: string): string => {
    const item = availabilityMap.get(date);
    if (!item) return 'status-unavailable';
    return `status-${item.status}`;
  };

  const isToday = (date: string): boolean => date === todayDate;

  const isSelected = (date: string): boolean => date === selectedDate;

  const renderDays = (): JSX.Element[] => {
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const statusClass = getStatusClass(dateStr);
      const todayClass = isToday(dateStr) ? ' today' : '';
      const selectedClass = isSelected(dateStr) ? ' selected' : '';

      days.push(
        <div
          key={day}
          className={`calendar-day ${statusClass}${todayClass}${selectedClass}`}
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
        <div>Dim</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Jeu</div>
        <div>Ven</div>
        <div>Sam</div>
      </div>
      <div className="calendar-grid">{renderDays()}</div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available" />
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <span className="legend-color unavailable" />
          <span>Indisponible</span>
        </div>
        <div className="legend-item">
          <span className="legend-color partial" />
          <span>Partiel</span>
        </div>
      </div>
    </div>
  );
}
