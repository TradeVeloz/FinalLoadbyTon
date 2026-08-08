import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ETAWidget } from './ETAWidget';

describe('ETAWidget', () => {
  it('renders the formatted ETA in minutes', () => {
    render(<ETAWidget etaMinutes={45} />);
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('rounds non-integer ETA values', () => {
    render(<ETAWidget etaMinutes={30.5} />);
    expect(screen.getByText('31 min')).toBeInTheDocument();
  });

  it('shows a placeholder when no ETA is provided', () => {
    render(<ETAWidget />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the status badge with a humanized label', () => {
    render(<ETAWidget etaMinutes={10} status="in_transit" />);
    expect(screen.getByText('In transit')).toBeInTheDocument();
  });

  it('renders no badge when status is omitted', () => {
    render(<ETAWidget etaMinutes={10} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('clamps the progress bar to 100% for very small ETAs', () => {
    const { container } = render(<ETAWidget etaMinutes={0} />);
    const bar = container.querySelector('.h-full.rounded-full');
    expect(bar).toHaveStyle({ width: '100%' });
  });

  it('clamps the progress bar to 0% for long ETAs', () => {
    const { container } = render(<ETAWidget etaMinutes={300} />);
    const bar = container.querySelector('.h-full.rounded-full');
    expect(bar).toHaveStyle({ width: '0%' });
  });
});
