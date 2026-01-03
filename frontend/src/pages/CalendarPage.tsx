import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { availabilityService } from '../services/api';
import { Calendar } from '../components/Calendar';
import type { Availability } from '../types';
import './CalendarPage.css';

type StatusType = 'available' | 'unavailable' | 'partial';

interface DayModalData {
  date: string;
  status: StatusType;
  fromTime: string;
  toTime: string;
}

interface SelectedDayInfo {
  date: string;
  status: StatusType | null;
  note: string | null;
}

export function CalendarPage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<SelectedDayInfo | null>(null);
  const [modalData, setModalData] = useState<DayModalData>({
    date: '',
    status: 'available',
    fromTime: '00:00',
    toTime: '23:59',
  });

  const isOwner = user?.role === 'owner' && isAuthenticated;

  const fetchAvailability = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await availabilityService.getMonthly(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        token || undefined
      );
      setAvailability(response.availability);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, token]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleDayClick = (date: string): void => {
    const existing = availability.find((a) => a.date === date);
    console.log('=== DAY CLICK DEBUG ===');
    console.log('Date clicked:', date);
    console.log('Is owner:', isOwner);
    console.log('Existing entry:', existing);
    console.log('Existing note:', existing?.note);
    console.log('Existing status:', existing?.status);

    if (!isOwner) {
      setSelectedDay({
        date,
        status: existing?.status || null,
        note: existing?.note || null,
      });
      return;
    }

    let fromTime = '00:00';
    let toTime = '23:59';

    if (existing?.note) {
      console.log('Parsing note...');
      const match1 = existing.note.match(/(\d{1,2}:\d{2})\s+to\s+(\d{1,2}:\d{2})/);
      const match2 = existing.note.match(/(\d{1,2}:\d{2})\s*à\s*(\d{1,2}:\d{2})/i);
      const match = match1 || match2;
      console.log('Match1 (English):', match1);
      console.log('Match2 (French):', match2);
      console.log('Final match:', match);
      if (match) {
        fromTime = match[1];
        toTime = match[2];
        console.log('SUCCESS: Parsed times:', fromTime, 'to', toTime);
      } else {
        console.log('FAILURE: Could not parse times from note');
      }
    } else {
      console.log('No note found, using defaults');
    }

    setModalData({
      date,
      status: (existing?.status as StatusType) || 'available',
      fromTime,
      toTime,
    });
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async (): Promise<void> => {
    if (!token) return;
    try {
      let note: string | undefined;
      if (modalData.status === 'partial') {
        note = `Disponible de ${modalData.fromTime} à ${modalData.toTime}`;
      }

      await availabilityService.create(
        modalData.date,
        modalData.status,
        note,
        token
      );
      setSuccess('Mis à jour');
      setModalOpen(false);
      fetchAvailability();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleLogin = (): void => {
    navigate('/login');
  };

  const handleLogout = (): void => {
    logout();
    setSelectedDay(null);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).toUpperCase();
  };

  const formatNote = (note: string | null): string | null => {
    if (!note) return null;
    return note
      .replace('Available from', 'DISPONIBLE DE')
      .replace(' to', ' À')
      .toUpperCase();
  };

  const getStatusLabel = (status: string | null): string => {
    if (!status) return 'INDISPONIBLE';
    switch (status) {
      case 'available':
        return 'DISPONIBLE';
      case 'unavailable':
        return 'INDISPONIBLE';
      case 'partial':
        return 'PARTIELLEMENT DISPONIBLE';
      default:
        return status.toUpperCase();
    }
  };

  const getStatusClass = (status: string | null): string => {
    if (!status) return 'status-undefined';
    return `status-${status}`;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Parking</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <span className="user-greeting">{user?.username.toUpperCase()}</span>
              <button className="btn btn-primary" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleLogin}>
              Connexion
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isLoading ? (
        <div className="loading">CHARGEMENT</div>
      ) : (
        <Calendar
          availability={availability}
          onDayClick={handleDayClick}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          selectedDate={isOwner ? modalData.date : selectedDay?.date}
        />
      )}

      {selectedDay && (
        <div className="day-details-panel">
          <div className="day-details-header">
            <h3>{formatDate(selectedDay.date)}</h3>
            <button
              className="close-details-btn btn-secondary"
              onClick={() => setSelectedDay(null)}
            >
              ×
            </button>
          </div>
          <div className={`day-details-status ${getStatusClass(selectedDay.status)}`}>
            <span className="status-label">{getStatusLabel(selectedDay.status)}</span>
            {selectedDay.status === 'partial' && selectedDay.note && (
              <span className="status-time">{formatNote(selectedDay.note)}</span>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Modifier</h2>
            <p className="modal-date">
              {formatDate(modalData.date)}
            </p>
            <div className="status-buttons">
              <button
                className={`status-btn available ${modalData.status === 'available' ? 'active' : ''}`}
                onClick={() => setModalData({ ...modalData, status: 'available' })}
              >
                Disponible
              </button>
              <button
                className={`status-btn partial ${modalData.status === 'partial' ? 'active' : ''}`}
                onClick={() => setModalData({ ...modalData, status: 'partial' })}
              >
                Partiel
              </button>
              <button
                className={`status-btn unavailable ${modalData.status === 'unavailable' ? 'active' : ''}`}
                onClick={() => setModalData({ ...modalData, status: 'unavailable' })}
              >
                Indisponible
              </button>
            </div>

            <div className={`time-selector ${modalData.status !== 'partial' ? 'disabled' : ''}`}>
              <label>DE</label>
              <input
                type="time"
                value={modalData.fromTime}
                onChange={(e) => setModalData({ ...modalData, fromTime: e.target.value })}
                disabled={modalData.status !== 'partial'}
              />
              <span>À</span>
              <input
                type="time"
                value={modalData.toTime}
                onChange={(e) => setModalData({ ...modalData, toTime: e.target.value })}
                disabled={modalData.status !== 'partial'}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
              >
                Enregistrer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
