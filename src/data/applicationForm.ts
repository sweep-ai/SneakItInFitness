export interface ApplicationOption {
  id: string;
  label: string;
}

export interface ApplicationStep {
  id: string;
  prompt: string;
  required?: boolean;
  type: 'text' | 'yesno' | 'single' | 'multi' | 'textarea' | 'contact' | 'occupationAge';
  placeholder?: string;
  maxSelections?: number;
  options?: ApplicationOption[];
}

export const applicationFormSteps: ApplicationStep[] = [
  {
    id: 'name',
    prompt: "Let's start with your name!",
    type: 'text',
    placeholder: 'Your full name',
    required: true,
  },
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
    id: 'goals',
    prompt: 'What is your primary goal over the next 6 months?',
    type: 'multi',
    required: true,
    maxSelections: 3,
    options: [
      { id: 'A', label: 'Lose 25+ lbs and keep it off' },
      { id: 'B', label: 'Rebuild my discipline, habits, structure & consistency' },
      { id: 'C', label: 'Increase energy, focus & performance at work' },
      { id: 'D', label: 'Become a more confident leader in my career & relationships / family' },
      { id: 'E', label: 'Build a lean, strong and confident body' },
      { id: 'F', label: 'Just become healthier' },
    ],
  },
  {
    id: 'seriousness',
    prompt: 'How serious are you about changing your life in the next 6 months?',
    type: 'single',
    required: true,
    options: [
      { id: 'A', label: "I'm all in. Willing to do whatever it takes and ready to execute." },
      { id: 'B', label: "I'm serious but need structure and accountability" },
      { id: 'C', label: "I want change but I'm not sure I'm ready" },
      { id: 'D', label: 'Just exploring options and here to waste time' },
    ],
  },
  {
    id: 'investment',
    prompt: 'If results were guaranteed, how prepared are you to work with a coach?',
    type: 'single',
    required: true,
    options: [
      { id: 'A', label: "I'm ready to get the help I need to hit my goals" },
      { id: 'B', label: "I'm interested and want to learn more about coaching" },
      { id: 'C', label: 'I want to stay stuck where I am and am not willing to get help' },
    ],
  },
  {
    id: 'occupationAge',
    prompt: 'What is your occupation and age?',
    type: 'occupationAge',
    required: true,
  },
  {
    id: 'contact',
    prompt: 'Best email and best phone number',
    type: 'contact',
    required: true,
  },
  {
    id: 'instagram',
    prompt: "What's your Instagram @ so we can review previous conversations or reach out?",
    type: 'text',
    placeholder: '@yourhandle',
    required: true,
  },
];

export const APPLICATION_FORM_STORAGE_KEY = 'sneakit-application';

export const DQ_SERIOUSNESS_OPTION = 'D';
export const DQ_INVESTMENT_OPTION = 'C';

export function isDisqualifiedLead(data: ApplicationFormData): boolean {
  return (
    data.seriousness === DQ_SERIOUSNESS_OPTION || data.investment === DQ_INVESTMENT_OPTION
  );
}

export function getDisqualificationReason(data: ApplicationFormData): string | null {
  if (data.seriousness === DQ_SERIOUSNESS_OPTION) {
    return 'waste_time';
  }
  if (data.investment === DQ_INVESTMENT_OPTION) {
    return 'not_willing_for_help';
  }
  return null;
}

export const applicationDqCopy = {
  headline: "Looks like you're not ready for coaching, that's okay!",
  subhead: 'Here are some resources to explore in the meantime',
};

export interface ApplicationFormData {
  name: string;
  isJewish: '' | 'yes' | 'no';
  situation: string;
  goals: string[];
  seriousness: string;
  instagram: string;
  investment: string;
  occupation: string;
  age: string;
  email: string;
  phone: string;
}

export const emptyApplicationFormData: ApplicationFormData = {
  name: '',
  isJewish: '',
  situation: '',
  goals: [],
  seriousness: '',
  instagram: '',
  investment: '',
  occupation: '',
  age: '',
  email: '',
  phone: '',
};
