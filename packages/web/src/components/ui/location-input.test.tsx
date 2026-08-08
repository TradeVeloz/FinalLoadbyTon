import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationInput, GeoLocation } from './location-input';

const mockResults = [
  {
    place_id: 101,
    display_name: 'Jebel Ali Port, Dubai, United Arab Emirates',
    lat: '24.999',
    lon: '55.058',
  },
  {
    place_id: 102,
    display_name: 'Jebel Ali Free Zone, Dubai, United Arab Emirates',
    lat: '24.977',
    lon: '55.030',
  },
];

const fetchMock = vi.fn();

describe('LocationInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders the label and input', () => {
    render(<LocationInput label="Pickup location" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Pickup location')).toBeInTheDocument();
  });

  it('debounces the search and shows suggestions', async () => {
    const user = userEvent.setup();
    render(<LocationInput label="Pickup location" value="" onChange={() => {}} />);

    await user.type(screen.getByLabelText('Pickup location'), 'jebel ali');
    expect(fetchMock).not.toHaveBeenCalled();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 3000 });

    expect(await screen.findByText('Jebel Ali Port, Dubai, United Arab Emirates')).toBeInTheDocument();
    expect(screen.getByText('Jebel Ali Free Zone, Dubai, United Arab Emirates')).toBeInTheDocument();
  });

  it('calls onChange and onSelect when a suggestion is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();

    render(
      <LocationInput label="Drop-off location" value="" onChange={onChange} onSelect={onSelect} />
    );

    await user.type(screen.getByLabelText('Drop-off location'), 'jebel ali port');
    await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 3000 });
    await user.click(await screen.findByText('Jebel Ali Port, Dubai, United Arab Emirates'));

    const selected: GeoLocation = {
      name: 'Jebel Ali Port, Dubai, United Arab Emirates',
      lat: 24.999,
      lng: 55.058,
    };
    expect(onSelect).toHaveBeenCalledWith(selected);
    expect(onChange).toHaveBeenCalledWith('Jebel Ali Port, Dubai, United Arab Emirates');
  });

  it('does not search for very short queries', async () => {
    const user = userEvent.setup();
    render(<LocationInput label="Pickup location" value="" onChange={() => {}} />);

    await user.type(screen.getByLabelText('Pickup location'), 'a');
    await vi.advanceTimersByTimeAsync(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
