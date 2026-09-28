import type { ApplicationWebhookPayload } from './ghl.js';

/** Column order for the Google Sheet `leads` tab. */
export const LEADS_TAB_HEADERS = [
  'Date',
  'Name',
  'Jewish',
  'Problem',
  'Goal',
  'Committed?',
  'Instagram',
  'Occupation',
  'Email',
  'Number',
  'Recieving Help',
  'No Show?',
  'UTM Campaign',
  'UTM Set',
  'UTM Ad',
] as const;

/**
 * Maps a form payload onto the leads-tab columns.
 * Meta ads template: utm_source=campaign.name, utm_medium=adset.name, utm_campaign=ad.name.
 */
export function formatLeadsTabRow(payload: ApplicationWebhookPayload): string[] {
  return [
    payload.submittedAt ?? '',
    payload.name ?? '',
    payload.isJewish ?? '',
    payload.situation?.label ?? '',
    payload.goal?.label ?? '',
    payload.readiness?.label ?? '',
    payload.instagram ?? '',
    payload.occupation ?? '',
    payload.email ?? '',
    payload.phone ?? '',
    payload.openToCoaching?.label ?? '',
    '',
    payload.utm_source ?? '',
    payload.utm_medium ?? '',
    payload.utm_campaign ?? '',
  ];
}
