export interface ApplicationOption {
  id: string;
  label: string;
}

export interface ApplicationStep {
  id: string;
  prompt: string;
  required?: boolean;
  type: 'text' | 'yesno' | 'single' | 'contactDetails' | 'occupationAge';
  placeholder?: string;
  options?: ApplicationOption[];
}

export const applicationFormSteps: ApplicationStep[] = [
  {
    id: 'isJewish',
    prompt: 'Are you Jewish?',
    type: 'yesno',
    required: true,
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: "No - But I'm a supporter of the tribe" },
    ],
  },
  {
    id: 'situation',
    prompt: 'Which best describes your situation right now?',
    type: 'single',
    required: true,
    options: [
      { id: 'A', label: "Successful on paper, but know I'm capable of more" },
      { id: 'B', label: "I want to change, but don't know how" },
      { id: 'C', label: 'I start strong, but struggle with consistency and staying disciplined' },
      { id: 'D', label: "I've let myself go and need to reinvent my life and identity" },
      { id: 'E', label: "I'm just curious and browsing" },
    ],
  },
  {
    id: 'goal',
    prompt: 'What is your primary goal over the next 6 months?',
    type: 'single',
    required: true,
    options: [
      { id: 'A', label: 'Lose 25+ lbs and keep it off' },
      { id: 'B', label: 'Rebuild my discipline, habits, structure & consistency' },
      { id: 'C', label: 'Increase energy, focus & performance at work' },
      { id: 'D', label: 'Become a more confident leader in my career & relationships / family' },
    ],
  },
  {
    id: 'openToCoaching',
    prompt:
      'Swolekol is an ONLINE fitness program (as described in the video) with 1:1 daily support from the coaching staff and community. Are you open to receiving expert professional help to improve your day to day health and fitness?',
    type: 'yesno',
    required: true,
    options: [
      { id: 'yes', label: "Yes, I'm open to expert coaching help" },
      { id: 'no', label: "No, I'm not looking for coaching support" },
    ],
  },
  {
    id: 'readiness',
    prompt:
      'Obviously coaching is a financial investment. If everything was a perfect fit and you were 100% confident that this is the right solution for you, are you in a position to invest into your healthiest quality of life?',
    type: 'single',
    required: true,
    options: [
      { id: 'A', label: 'Yes, I am in a position to invest in my success' },
      { id: 'B', label: 'Seriously considering it, need to understand more first' },
      { id: 'C', label: 'Not in a position to invest in my success right now' },
    ],
  },
  {
    id: 'occupationAge',
    prompt: 'What is your occupation and age?',
    type: 'occupationAge',
    required: true,
  },
  {
    id: 'contactDetails',
    prompt: "Let's get your contact details (Instagram or Facebook)",
    type: 'contactDetails',
    required: true,
  },
];

export const APPLICATION_FORM_STORAGE_KEY = 'sneakit-application';

/** Selecting "just curious / browsing" disqualifies the lead. */
export const DQ_SITUATION_OPTION = 'E';

/** Answering "No" to open-to-coaching disqualifies the lead. */
export const DQ_OPEN_TO_COACHING_OPTION = 'no';

/** Bottom readiness answer disqualifies the lead. */
export const DQ_READINESS_OPTION = 'C';

/** Webhook/GHL reason for the financial-investment DQ. */
export const FINANCIAL_DQ_REASON = 'gathering_information';

export function isDisqualifiedLead(data: ApplicationFormData): boolean {
  return (
    data.situation === DQ_SITUATION_OPTION ||
    data.openToCoaching === DQ_OPEN_TO_COACHING_OPTION ||
    data.readiness === DQ_READINESS_OPTION
  );
}

export function getDisqualificationReason(data: ApplicationFormData): string | null {
  if (data.situation === DQ_SITUATION_OPTION) return 'just_browsing';
  if (data.openToCoaching === DQ_OPEN_TO_COACHING_OPTION) return 'not_open_to_coaching';
  if (data.readiness === DQ_READINESS_OPTION) return FINANCIAL_DQ_REASON;
  return null;
}

export function isFinancialDisqualification(data: ApplicationFormData): boolean {
  return data.readiness === DQ_READINESS_OPTION;
}

export const applicationDqCopy: Record<'default' | 'just_browsing', { headline: string; subhead: string }> = {
  default: {
    headline: "Looks like you're not ready for coaching, that's okay!",
    subhead: 'Here are some resources to explore in the meantime',
  },
  just_browsing: {
    headline: "No worries — come back when you're ready!",
    subhead:
      "Swolekol is for Jewish adults who are serious about transforming their health. When you're ready to take action, we'd love to have you apply. Check out our resources below in the meantime.",
  },
};

export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  isJewish: '' | 'yes' | 'no';
  situation: string;
  goal: string;
  openToCoaching: '' | 'yes' | 'no';
  readiness: string;
  occupation: string;
  age: string;
}

export const emptyApplicationFormData: ApplicationFormData = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  isJewish: '',
  situation: '',
  goal: '',
  openToCoaching: '',
  readiness: '',
  occupation: '',
  age: '',
};
