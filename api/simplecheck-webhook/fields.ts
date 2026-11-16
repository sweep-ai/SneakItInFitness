type Json = Record<string, any>;

/**
 * Quiz answers SimpleCheck sends in `data.customFields`, keyed by slug, mapped to
 * the readable question text SMSLoop's AI reads. This is an ALLOWLIST on purpose:
 * `customFields` also repeats credit and identity fields (creditScore, income,
 * dti, ipAddress, offer details, consents). Those must never reach SMSLoop, so a
 * new or unknown key is dropped rather than forwarded.
 */
export const QUIZ_FIELD_LABELS: Record<string, string> = {
  which_option_fits_you_best: 'Which option fits you best?',
  which_best_describes_your_situation: 'What is going on right now?',
  what_does_a_successful_result_for_you: 'What does a successful result for you look like?',
  swolekol_is_an_online_fitness_program: 'Swolekol is an online fitness program',
  what_is_your_occupation: 'Occupation',
  what_is_your_age: 'Age',
  what_is_your_instagram_or_facebook: 'Instagram or Facebook',
};

const MAX_FIELD_VALUE_LENGTH = 1000;

/** Empty answers and a bare "@" (an untouched Instagram input) carry no signal. */
function isMeaningful(value: string): boolean {
  const trimmed = value.trim();
  return trimmed !== '' && trimmed !== '@';
}

/** Allowlisted quiz answers as `{ question text: answer }` for SMSLoop `fields`. */
export function mapQuizFields(customFields: Json | null | undefined): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!customFields || typeof customFields !== 'object') return fields;

  for (const [slug, label] of Object.entries(QUIZ_FIELD_LABELS)) {
    const value = customFields[slug];
    if (typeof value !== 'string' && typeof value !== 'number') continue;

    const text = String(value);
    if (isMeaningful(text)) fields[label] = text.trim().slice(0, MAX_FIELD_VALUE_LENGTH);
  }

  return fields;
}

/** customFields keys we do not map, for log review. Names only, never values. */
export function unmappedCustomFieldKeys(customFields: Json | null | undefined): string[] {
  if (!customFields || typeof customFields !== 'object') return [];
  return Object.keys(customFields).filter((key) => !(key in QUIZ_FIELD_LABELS));
}
