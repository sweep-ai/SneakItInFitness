import {
  applicationFormSteps,
  isDisqualifiedLead,
  getDisqualificationReason,
  type ApplicationFormData,
} from '../data/applicationForm';

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
  readiness: ApplicationChoiceAnswer;
  leadStatus: 'qualified' | 'disqualified';
  dqReason: string | null;
  submittedAt: string;
  source: string;
  /** Flat Zapier-friendly fields (prompt/code/label per question). */
  answers: {
    isJewish: string;
    situationPrompt: string;
    situationCode: string;
    situation: string;
    goalPrompt: string;
    goalCode: string;
    goal: string;
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

/** Formats quiz answers for Zapier + GHL from the application form state. */
export function formatApplicationPayload(data: ApplicationFormData): ApplicationWebhookPayload {
  const disqualified = isDisqualifiedLead(data);
  const dqReason = getDisqualificationReason(data);

  const situation = formatChoiceAnswer('situation', data.situation);
  const goal = formatChoiceAnswer('goal', data.goal);
  const readiness = formatChoiceAnswer('readiness', data.readiness);
  const isJewish = data.isJewish === 'yes' ? 'Yes' : 'No';
  const occupation = data.occupation.trim();
  const age = data.age.trim();

  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    instagram: data.instagram.trim(),
    isJewish,
    occupation,
    age,
    situation,
    goal,
    readiness,
    leadStatus: disqualified ? 'disqualified' : 'qualified',
    dqReason,
    submittedAt: new Date().toISOString(),
    source: 'sneakit-application-form',
    answers: {
      isJewish,
      situationPrompt: situation.prompt,
      situationCode: situation.code,
      situation: situation.label,
      goalPrompt: goal.prompt,
      goalCode: goal.code,
      goal: goal.label,
      readinessPrompt: readiness.prompt,
      readinessCode: readiness.code,
      readiness: readiness.label,
      occupation,
      age,
    },
  };
}
