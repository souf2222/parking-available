/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '../src/components/Calendar';
import type { Availability } from '../src/types';

describe('Calendar Component', () => {
  const mockAvailability: Availability[] = [
    {
      id: 1,
      date: '2026-01-15',
      status: 'available',
      note: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      date: '2026-01-20',
      status: 'unavailable',
      note: 'Not available until 6 PM',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ];

  const mockOnDayClick = vi.fn();
  const mockOnMonthChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render calendar with correct month', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={[]}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('should render calendar days', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={[]}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show available status with correct class', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={mockAvailability}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    const day15 = screen.getByText('15').closest('div');
    expect(day15).toHaveClass('status-available');
  });

  it('should show unavailable status with correct class', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={mockAvailability}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    const day20 = screen.getByText('20').closest('div');
    expect(day20).toHaveClass('status-unavailable');
  });

  it('should show note for partial availability', () => {
    const currentDate = new Date(2026, 0, 1);
    const availabilityWithPartial: Availability[] = [
      {
        id: 3,
        date: '2026-01-25',
        status: 'partial',
        note: 'Available from 1 PM',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    render(
      <Calendar
        availability={availabilityWithPartial}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    const day25 = screen.getByText('25').closest('div');
    expect(day25).toHaveClass('status-partial');
    expect(screen.getByText('Available from 1 PM')).toBeInTheDocument();
  });

  it('should call onDayClick when day is clicked', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={[]}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    fireEvent.click(screen.getByText('1'));
    expect(mockOnDayClick).toHaveBeenCalledWith('2026-01-01');
  });

  it('should call onMonthChange when navigation buttons are clicked', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={[]}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    fireEvent.click(screen.getByText('>'));
    expect(mockOnMonthChange).toHaveBeenCalled();

    vi.clearAllMocks();
    fireEvent.click(screen.getByText('<'));
    expect(mockOnMonthChange).toHaveBeenCalled();
  });

  it('should render legend items', () => {
    const currentDate = new Date(2026, 0, 1);
    render(
      <Calendar
        availability={[]}
        onDayClick={mockOnDayClick}
        currentDate={currentDate}
        onMonthChange={mockOnMonthChange}
      />
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });
});
