import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type FunnelVariant = 'default' | 'schedule';

export type BookingConversionEvent = 'Schedule' | 'CompleteRegistration';

export interface FunnelPaths {
  variant: FunnelVariant;
  home: string;
  male: string;
  female: string;
  booking: string;
  postBooking: string;
}

/** `/schedule` mirrors the main funnel with a different Meta conversion on book. */
export function isSchedulePath(pathname: string): boolean {
  return pathname === '/schedule' || pathname.startsWith('/schedule/');
}

export function funnelVariantFromPath(pathname: string): FunnelVariant {
  return isSchedulePath(pathname) ? 'schedule' : 'default';
}

export function funnelPathsFor(variant: FunnelVariant): FunnelPaths {
  const prefix = variant === 'schedule' ? '/schedule' : '';
  return {
    variant,
    home: prefix || '/',
    male: `${prefix}/male`,
    female: `${prefix}/female`,
    booking: `${prefix}/booking`,
    postBooking: `${prefix}/post-booking`,
  };
}

/**
 * Original funnel: booking confirmed = CompleteRegistration.
 * /schedule funnel: booking page = Lead (existing), post-booking = Schedule.
 */
export function bookingConversionEvent(variant: FunnelVariant): BookingConversionEvent {
  return variant === 'schedule' ? 'Schedule' : 'CompleteRegistration';
}

export function useFunnelPaths(): FunnelPaths {
  const { pathname } = useLocation();
  return useMemo(() => funnelPathsFor(funnelVariantFromPath(pathname)), [pathname]);
}
