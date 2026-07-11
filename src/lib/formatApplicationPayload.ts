import {
  applicationFormSteps,
  isDisqualifiedLead,
  getDisqualificationReason,
  type ApplicationFormData,
} from '../data/applicationForm';

const SINGLE_CHOICE_STEP_IDS = ['situation', 'seriousness', 'investment'] as const;

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

function formatSingleChoiceFields(data: ApplicationFormData) {
  return Object.fromEntries(
    SINGLE_CHOICE_STEP_IDS.flatMap((stepId) => {
      const code = data[stepId];
      return [
        [stepId, getOptionLabel(stepId, code)],
        [`${stepId}Code`, code],
        [`${stepId}Prompt`, getStepPrompt(stepId)],
      ];
    }),
  ) as Record<
    `${(typeof SINGLE_CHOICE_STEP_IDS)[number]}` | `${(typeof SINGLE_CHOICE_STEP_IDS)[number]}Code` | `${(typeof SINGLE_CHOICE_STEP_IDS)[number]}Prompt`,
    string
  >;
}

export interface ApplicationWebhookPayload {
  name: string;
  isJewish: string;
  situation: string;
  situationCode: string;
  situationPrompt: string;
  goals: string;
  goalsCodes: string;
  goalsPrompt: string;
  seriousness: string;
  seriousnessCode: string;
  seriousnessPrompt: string;
  instagram: string;
  investment: string;
  investmentCode: string;
  investmentPrompt: string;
  occupation: string;
  age: string;
  email: string;
  phone: string;
  leadStatus: 'qualified' | 'disqualified';
  dqReason: string | null;
  dqReasonLegacy?: string;
  submittedAt: string;
  source: string;
}

export function formatApplicationPayload(data: ApplicationFormData): ApplicationWebhookPayload {
  const disqualified = isDisqualifiedLead(data);
  const dqReason = getDisqualificationReason(data);

  return {
    name: data.name.trim(),
    isJewish: data.isJewish === 'yes' ? 'Yes' : 'No',
    ...formatSingleChoiceFields(data),
    goals: data.goals.map((goalId) => getOptionLabel('goals', goalId)).join(' | '),
    goalsCodes: data.goals.join(', '),
    goalsPrompt: getStepPrompt('goals'),
    instagram: data.instagram.trim(),
    occupation: data.occupation.trim(),
    age: data.age.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    leadStatus: disqualified ? 'disqualified' : 'qualified',
    dqReason,
    // Legacy Zapier filters may still reference the old investment DQ reason code.
    ...(dqReason === 'not_willing_for_help' ? { dqReasonLegacy: 'not_ready_to_invest' } : {}),
    submittedAt: new Date().toISOString(),
    source: 'sneakit-application-form',
  };
}
