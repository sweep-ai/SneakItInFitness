export interface ApplicationOption {
  id: string;
  label: string;
}

export interface ApplicationStep {
  id: string;
  prompt: string;
  required?: boolean;
  type: 'text' | 'yesno' | 'single' | 'contactDetails';
  placeholder?: string;
  options?: ApplicationOption[];
}

export const applicationFormSteps: ApplicationStep[] = [
  {
    id: 'isJewish',
    prompt: 'Are you Jewish?',
    type: 'yesno',
    required: true,
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
    id: 'readiness',
    prompt:
      'If we showed you exactly how to build your dream body in the next 30 to 60 days, are you ready to invest into yourself and coaching guidance?!',
    type: 'single',
    required: true,
    options: [
      { id: 'A', label: 'Yes, ready to move if it is the right fit' },
      { id: 'B', label: 'Seriously considering it, need to understand more first' },
      { id: 'C', label: 'Not right now, just gathering information' },
    ],
  },
  {
    id: 'occupation',
    prompt: 'What is your occupation?',
    type: 'text',
    placeholder: 'Your occupation',
    required: true,
  },
  {
    id: 'contactDetails',
    prompt: "Let's get your contact details",
    type: 'contactDetails',
    required: true,
  },
];

export const APPLICATION_FORM_STORAGE_KEY = 'sneakit-application';

/** Bottom readiness answer disqualifies the lead. */
export const DQ_READINESS_OPTION = 'C';

export function isDisqualifiedLead(data: ApplicationFormData): boolean {
  return data.readiness === DQ_READINESS_OPTION;
}

export function getDisqualificationReason(data: ApplicationFormData): string | null {
  if (data.readiness === DQ_READINESS_OPTION) {
    return 'gathering_information';
  }
  return null;
}

export const applicationDqCopy = {
  headline: "Looks like you're not ready for coaching, that's okay!",
  subhead: 'Here are some resources to explore in the meantime',
};

export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  isJewish: '' | 'yes' | 'no';
  situation: string;
  goal: string;
  readiness: string;
  occupation: string;
}

export const emptyApplicationFormData: ApplicationFormData = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  isJewish: '',
  situation: '',
  goal: '',
  readiness: '',
  occupation: '',
};
