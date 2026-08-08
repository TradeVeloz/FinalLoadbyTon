import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusTimeline } from './StatusTimeline';

describe('StatusTimeline', () => {
  const milestones = [
    { label: 'Job awarded', timestamp: '2026-08-08T10:00:00.000Z', completed: true },
    { label: 'In transit', timestamp: '2026-08-08T12:00:00.000Z', completed: true },
    { label: 'Arrived at destination', timestamp: '', completed: false },
  ];

  it('renders all milestone labels', () => {
    render(<StatusTimeline milestones={milestones} />);
    expect(screen.getByText('Job awarded')).toBeInTheDocument();
    expect(screen.getByText('In transit')).toBeInTheDocument();
    expect(screen.getByText('Arrived at destination')).toBeInTheDocument();
  });

  it('renders a placeholder timestamp for milestones without one', () => {
    render(<StatusTimeline milestones={milestones} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no milestones', () => {
    render(<StatusTimeline milestones={[]} />);
    expect(screen.getByText('No milestones recorded yet.')).toBeInTheDocument();
  });
});
