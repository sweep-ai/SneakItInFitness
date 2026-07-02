import { applicationFormSteps, isDisqualifiedLead, getDisqualificationReason, type ApplicationFormData } from '../data/applicationForm';

function getOptionLabel(stepId: string, optionId: string): string {
  const step = applicationFormSteps.find((item) => item.id === stepId);
  return step?.options?.find((option) => option.id === optionId)?.label ?? optionId;
}

export function formatApplicationPayload(data: ApplicationFormData) {
  const disqualified = isDisqualifiedLead(data);

  return {
    name: data.name.trim(),
    isJewish: data.isJewish === 'yes' ? 'Yes' : 'No',
    situation: getOptionLabel('situation', data.situation),
    situationCode: data.situation,
    goals: data.goals.map((goalId) => getOptionLabel('goals', goalId)).join(' | '),
    goalsCodes: data.goals.join(', '),
    seriousness: getOptionLabel('seriousness', data.seriousness),
    seriousnessCode: data.seriousness,
    instagram: data.instagram.trim(),
    idealOutcome: getOptionLabel('idealOutcome', data.idealOutcome),
    idealOutcomeCode: data.idealOutcome,
    investment: getOptionLabel('investment', data.investment),
    investmentCode: data.investment,
    occupation: data.occupation.trim(),
    age: data.age.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    leadStatus: disqualified ? 'disqualified' : 'qualified',
    dqReason: getDisqualificationReason(data),
    submittedAt: new Date().toISOString(),
    source: 'sneakit-application-form',
  };
}
