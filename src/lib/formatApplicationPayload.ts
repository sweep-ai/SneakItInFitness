import {
  applicationFormSteps,
  isDisqualifiedLead,
  getDisqualificationReason,
  type ApplicationFormData,
} from '../data/applicationForm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { getStoredUtmParams, type UtmParams } from './utm';

const CHOICE_STEP_IDS = ['situation', 'goal', 'readiness'] as const;

export interface ApplicationChoiceAnswer {
  prompt: string;
  code: string;
  label: string;
}

export interface ApplicationWebhookPayload {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  isJewish: string;
  occupation: string;
  age: string;
  situation: ApplicationChoiceAnswer;
  goal: ApplicationChoiceAnswer;
  /** Yes/No answer for openness to online 1:1 coaching. */
  openToCoaching: ApplicationChoiceAnswer;
  readiness: ApplicationChoiceAnswer;
  leadStatus: 'qualified' | 'disqualified';
  dqReason: string | null;
  submittedAt: string;
  source: string;
  /** Meta Ads UTM params captured from the landing URL (empty strings when absent). */
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  utm_id: string;
  /** Flat Zapier-friendly fields (prompt/code/label per question). */
  answers: {
    isJewish: string;
    situationPrompt: string;
    situationCode: string;
    situation: string;
    goalPrompt: string;
    goalCode: string;
    goal: string;
    openToCoachingPrompt: string;
    openToCoachingCode: string;
    openToCoaching: string;
    readinessPrompt: string;
    readinessCode: string;
    readiness: string;
    occupation: string;
    age: string;
  };
}

function getStep(stepId: string) {
  return applicationFormSteps.find((item) => item.id === stepId);
}

function getOptionLabel(stepId: string, optionId: string): string {
  const step = getStep(stepId);
  return step?.options?.find((option) => option.id === optionId)?.label ?? optionId;
}

function getStepPrompt(stepId: string): string {
  return getStep(stepId)?.prompt ?? '';
}

/** Always send Zapier/CRM a clean E.164 phone (e.g. +13105615995). */
function formatPhoneForPayload(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return trimmed;

  const parsed = parsePhoneNumberFromString(trimmed, 'US');
  if (parsed?.number) {
    return parsed.number;
  }

  return trimmed;
}

function formatChoiceAnswer(
  stepId: (typeof CHOICE_STEP_IDS)[number],
  code: string
): ApplicationChoiceAnswer {
  return {
    prompt: getStepPrompt(stepId),
    code,
    label: getOptionLabel(stepId, code),
  };
}

function formatYesNoAnswer(
  stepId: 'openToCoaching',
  value: '' | 'yes' | 'no'
): ApplicationChoiceAnswer {
  const code = value === 'yes' || value === 'no' ? value : '';
  const stepLabel = code
    ? getStep(stepId)?.options?.find((option) => option.id === code)?.label
    : undefined;
  return {
    prompt: getStepPrompt(stepId),
    code,
    label: stepLabel ?? (code === 'yes' ? 'Yes' : code === 'no' ? 'No' : ''),
  };
}

function flattenUtm(utm: UtmParams) {
  return {
    utm_source: utm.utm_source ?? '',
    utm_medium: utm.utm_medium ?? '',
    utm_campaign: utm.utm_campaign ?? '',
    utm_content: utm.utm_content ?? '',
    utm_term: utm.utm_term ?? '',
    utm_id: utm.utm_id ?? '',
  };
}

/** Formats quiz answers for Zapier + GHL from the application form state. */
export function formatApplicationPayload(
  data: ApplicationFormData,
  utm: UtmParams = getStoredUtmParams()
): ApplicationWebhookPayload {
  const disqualified = isDisqualifiedLead(data);
  const dqReason = getDisqualificationReason(data);

  const situation = formatChoiceAnswer('situation', data.situation);
  const goal = formatChoiceAnswer('goal', data.goal);
  const openToCoaching = formatYesNoAnswer('openToCoaching', data.openToCoaching);
  const readiness = formatChoiceAnswer('readiness', data.readiness);
  const isJewish = getOptionLabel('isJewish', data.isJewish);
  const occupation = data.occupation.trim();
  const age = data.age.trim();

  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: formatPhoneForPayload(data.phone),
    instagram: data.instagram.trim(),
    isJewish,
    occupation,
    age,
    situation,
    goal,
    openToCoaching,
    readiness,
    leadStatus: disqualified ? 'disqualified' : 'qualified',
    dqReason,
    submittedAt: new Date().toISOString(),
    source: 'sneakit-application-form',
    ...flattenUtm(utm),
    answers: {
      isJewish,
      situationPrompt: situation.prompt,
      situationCode: situation.code,
      situation: situation.label,
      goalPrompt: goal.prompt,
      goalCode: goal.code,
      goal: goal.label,
      openToCoachingPrompt: openToCoaching.prompt,
      openToCoachingCode: openToCoaching.code,
      openToCoaching: openToCoaching.label,
      readinessPrompt: readiness.prompt,
      readinessCode: readiness.code,
      readiness: readiness.label,
      occupation,
      age,
    },
  };
}
