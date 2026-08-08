import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyAED(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatTerminalName(terminal: string): string {
  switch (terminal) {
    case 'KHALIFA': return 'Khalifa Port (Abu Dhabi)';
    case 'SHARJAH': return 'Sharjah Container Terminal';
    case 'KHORFAKKAN': return 'Khor Fakkan Container Terminal';
    case 'MINASAQR': return 'Mina Saqr (RAK)';
    case 'FUJAIRAH': return 'Fujairah Terminal';
    default: return terminal;
  }
}

export function formatDeliveryArea(area: string): string {
  switch (area) {
    case 'JAFZA_NORTH': return 'JAFZA North (Zone 1-4)';
    case 'JAFZA_SOUTH': return 'JAFZA South (Zone 5-9)';
    case 'AL_QUOZ': return 'Al Quoz Industrial';
    case 'DIP': return 'Dubai Investments Park';
    case 'NIP': return 'National Industries Park';
    case 'DAFZA': return 'Dubai Airport Freezone';
    case 'DIC': return 'Dubai Industrial City';
    case 'DUBAI_SOUTH': return 'Dubai South (Logistics District)';
    default: return area;
  }
}

export function formatContainerSize(size: string): string {
  switch (size) {
    case 'TWENTY_FT': return "20' Standard Dry";
    case 'FORTY_FT': return "40' Standard Dry";
    case 'FORTY_HC': return "40' High Cube (HC)";
    case 'REEFER': return "40' Refrigerated (Reefer)";
    default: return size;
  }
}

export interface RouteLabelsInput {
  pickupAddress?: string;
  pickupTerminal?: string;
  deliveryAddress?: string;
  deliveryArea?: string;
}

export function pickupLabel(location: RouteLabelsInput): string {
  if (location.pickupAddress) return location.pickupAddress;
  if (location.pickupTerminal) return formatTerminalName(location.pickupTerminal);
  return 'Pickup location';
}

export function dropLabel(location: RouteLabelsInput): string {
  if (location.deliveryAddress) return location.deliveryAddress;
  if (location.deliveryArea) return formatDeliveryArea(location.deliveryArea);
  return 'Drop-off location';
}
