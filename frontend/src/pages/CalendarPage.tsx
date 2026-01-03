import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { availabilityService } from '../services/api';
import { Calendar } from '../components/Calendar';
import type { Availability } from '../types';
import './CalendarPage.css';

type StatusType = 'available' | 'unavailable' | 'partial';

interface DayModalData {
  date: string;
  status: StatusType;
  note: string;
  existingNote: string | null;
}

export function CalendarPage() {
  const { user, logout, token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DayModalData>({
    date: '',
    status: 'available',
    note: '',
    existingNote: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchAvailability = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await availabilityService.getMonthly(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        token
      );
      setAvailability(response.availability);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, token]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleDayClick = (date: string): void => {
    const existing = availability.find((a) => a.date === date);
    setModalData({
      date,
      status: existing?.status || 'available',
      note: existing?.note || '',
      existingNote: existing?.note || null,
    });
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async (): Promise<void> => {
    if (!token) return;
    try {
      setIsSaving(true);
      await availabilityService.create(
        modalData.date,
        modalData.status,
        modalData.note || undefined,
        token
      );
      setSuccess('Availability updated successfully');
      setModalOpen(false);
      fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!token) return;
    try {
      setIsSaving(true);
      await availabilityService.delete(modalData.date, token);
      setSuccess('Availability deleted');
      setModalOpen(false);
      fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete availability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = (): void => {
    logout();
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Parking Availability</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user?.username}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <Calendar
          availability={availability}
          onDayClick={handleDayClick}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
        />
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px' }}>Update Availability</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              {new Date(modalData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="form-group">
              <label>Status</label>
              <select
                value={modalData.status}
                onChange={(e) =>
                  setModalData({ ...modalData, status: e.target.value as StatusType })
                }
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="form-group">
              <label>Note (optional)</label>
              <textarea
                value={modalData.note}
                onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
                placeholder="e.g., Available from 1 PM"
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
                style={{ flex: 1 }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {modalData.existingNote && (
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isSaving}
                >
                  Delete
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
