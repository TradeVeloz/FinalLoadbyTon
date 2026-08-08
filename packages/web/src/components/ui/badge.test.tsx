import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Open</Badge>);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('applies the default variant styling', () => {
    const { container } = render(<Badge>Open</Badge>);
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('applies the bidding variant styling', () => {
    const { container } = render(<Badge variant="bidding">Bidding</Badge>);
    expect(container.firstChild).toHaveClass('bg-orange-50', 'animate-pulse');
  });

  it('merges a custom className', () => {
    const { container } = render(<Badge className="my-custom-class">Open</Badge>);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
