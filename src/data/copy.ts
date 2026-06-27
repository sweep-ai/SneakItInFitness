export type CopyVariant = 'neutral' | 'male' | 'female';
export type FunnelConcept = 'cultural' | 'work' | 'systems' | 'food' | 'yoyo';
export type FunnelGender = 'male' | 'female';

export interface FunnelCopy {
  headline: string;
  headlineHighlight?: string;
  subhead: string;
}

export function getIcpAudienceLabel(gender?: FunnelGender | 'neutral'): string {
  if (gender === 'male') return 'Jewish men';
  if (gender === 'female') return 'Jewish women';
  return 'Jewish adults';
}

export function getIcpCallout(gender?: FunnelGender | 'neutral'): string {
  return `For ${getIcpAudienceLabel(gender)} looking for change`;
}

function titleCaseWords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getVslSectionLabel(gender?: FunnelGender | 'neutral'): string {
  const audience = titleCaseWords(getIcpAudienceLabel(gender));
  return `Discover The Simple System Transforming ${audience} In Less Than 4 Hrs/Week Without Sacrificing Their Career And Culture`;
}

export function getExclusiveProgramAudiencePhrase(gender?: FunnelGender | 'neutral'): string {
  if (gender === 'male') {
    return 'Jewish men ready to achieve a body and identity they are proud of';
  }
  if (gender === 'female') {
    return 'Jewish women ready to achieve a body and identity they are proud of';
  }
  return 'Jewish adults ready to achieve a body and identity they are proud of';
}

export const founderManifestoLines = [
  { text: "You'll only change as much as your standards allow.", emphasis: false },
  {
    text: 'I built this system because I refuse to keep starting over.',
    emphasis: true,
  },
  { text: 'You have the effort but you are missing the structure.', emphasis: false },
  {
    text: "It's time to stop hiding from who you were meant to become.",
    emphasis: true,
  },
] as const;

export const funnelCopy: Record<CopyVariant, FunnelCopy> = {
  neutral: {
    headline: 'YOU KNOW SOMETHING NEEDS TO CHANGE',
    headlineHighlight: 'NEEDS TO CHANGE',
    subhead:
      "Ready to finally become the person you've always known you could be with a system built around your real Jewish life?",
  },
  male: {
    headline: "You don't need more discipline. You need a system that fits your real life.",
    subhead:
      'Tired of work, family, and life always winning over your health, and are ready for a system built for how you actually live...',
  },
  female: {
    headline: "You don't need more discipline. You need a system that fits your real life.",
    subhead:
      'Tired of work, family, and life always winning over your health, and are ready for a system built for how you actually live...',
  },
};

export const funnelCopyByConcept: Record<
  FunnelConcept,
  Record<FunnelGender, FunnelCopy>
> = {
  cultural: {
    female: {
      headline: "Every week you restart. Shabbat hits. The plan falls apart.",
      subhead:
        'Tired of restarting every week when Shabbat hits, and are ready for a plan built around kosher living and your real Jewish week...',
    },
    male: {
      headline: "Every week you restart. Shabbat hits. The plan falls apart.",
      subhead:
        'Tired of restarting every week when Shabbat hits, and are ready for a plan built around kosher living and your real Jewish week...',
    },
  },
  work: {
    female: {
      headline: "Exhausted after work. Health keeps taking a backseat.",
      subhead:
        'Tired of coming home exhausted and watching fitness keep taking a back seat, and are ready for a system built around your actual hours...',
    },
    male: {
      headline: "Exhausted after work. Health keeps taking a backseat.",
      subhead:
        'Tired of coming home exhausted and watching fitness keep taking a back seat, and are ready for a system built around your actual hours...',
    },
  },
  systems: {
    female: {
      headline: "You are putting in effort. Your body still is not changing. Here is why.",
      subhead:
        'Tired of putting in effort without seeing your body change, and are ready to finally build something that holds...',
    },
    male: {
      headline: "You are putting in effort. Your body still is not changing. Here is why.",
      subhead:
        'Tired of putting in effort without seeing your body change, and are ready to finally build something that holds...',
    },
  },
  food: {
    female: {
      headline: "You do not need to give up your favorite foods to get in shape.",
      subhead:
        'Tired of feeling like you have to skip Shabbat dinner to get lean, and are ready to keep your meals and still hit your goals...',
    },
    male: {
      headline: "You do not need to give up your favorite foods to get in shape.",
      subhead:
        'Tired of feeling like you have to skip Shabbat dinner to get lean, and are ready to keep your meals and still hit your goals...',
    },
  },
  yoyo: {
    female: {
      headline: 'You are not the problem. The restrictive plans were.',
      subhead:
        'Tired of the losing and gaining fat endless cycle, and are ready to lose the weight for good...',
    },
    male: {
      headline: 'You are not the problem. The restrictive plans were.',
      subhead:
        'Tired of crash cutting, gaining it back, and starting over again, and are ready to break the cycle for good...',
    },
  },
};

export const foodFunnelCopy: FunnelCopy = {
  headline: 'What I eat on Shabbat and still hit my macros.',
  subhead:
    'Tired of undoing every cut because your plan never fit Shabbat or family meals, and are ready to see how you can keep both and still hit your goals...',
};

export const yoyoFunnelCopy: FunnelCopy = {
  headline: 'Done with losing weight just to gain it back?',
  subhead:
    'Tired of the losing and gaining fat endless cycle, and are ready to lose the weight for good...',
};

export const bookingCopy = {
  stepLabel: 'Step 2',
  headline: 'Book Your Strategy Call',
};

export const postBookingCopy = {
  congratsLabel: 'Congrats',
  headline: "You're Almost There...",
  phoneNumber: '+1 310-561-5995',
  steps: {
    intro: {
      label: 'Step 1 of 5',
      prompt: 'Expect A Confirmation Call Within 24 Hours',
    },
    video: {
      label: 'Step 2 of 5',
      prompt: 'Watch The Breakdown Video Before Continuing',
    },
    faq: {
      label: 'Step 3 of 5',
      prompt: 'Review These Common Questions Before Continuing',
    },
    confirm: {
      label: 'Step 4 of 5',
      prompt: 'Confirm Your Appointment In Your Calendar',
    },
    prep: {
      label: 'Step 5 of 5',
      prompt: 'Prepare For Your Strategy Call',
    },
  },
};

export const testimonialSectionTitle = 'Take their word for it';

export const finalCtaCopy = {
  headline: 'Ready to stop restarting?',
  subhead:
    'Tired of watching the same restart cycle repeat, and are ready to book a strategy call and see if this is the right fit for your life...',
};

export const prepChecklist = [
  'Confirm the booking email',
  'Come prepared with questions and a pen and paper',
  'Join in a quiet place with strong wifi connection',
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: 'I work long hours. Will I actually have time for this?',
    answer:
      'That is the exact reason I built this structure. A lot of people think long hours are why they cannot do it, but long hours are actually why you need a sustainable system that fits your life. If you only have 2 to 3 hours per week, maximum, and you want to make a real change, this is built for you.',
  },
  {
    question: 'I have tried programs before and always fall off. Why would this be different?',
    answer:
      'Most programs are cookie-cutter: copy-and-paste routines with zero personalization. That is exactly why this is different. Most plans ask you to live like someone you are not, and I do not do that. You get a system built around you, your goals, and your real life—plus consistent accountability so that no matter what comes up, you keep progressing.',
  },
  {
    question: 'Will this work with Shabbat, holidays, and kosher lifestyle?',
    answer:
      'Yes. That is the point. I map your plan around Jewish life, not against it. Shabbat, holidays, kosher meals. All of it. You should not have to choose between your values and your results.',
  },
  {
    question: 'Is this another crash diet or extreme cut?',
    answer:
      'No—and I would never do that again, and I do not want you to either. Crash diets are how you lose the weight and then gain it back, or end up heavier than when you started. We build habits you can actually keep long-term, because anyone can lose weight—the real goal is keeping it off forever. This is about building the correct, sustainable habits for the rest of your life, not hopping from program to program.',
  },
  {
    question: 'How much support do I actually get?',
    answer:
      'Real, persistent 1:1 support and accountability—not a PDF and “good luck.” You get direct access to me and my team, with regular check-ins. I adjust your plan consistently when life shifts, your goals shift, you plateau, or all of the above. I care if you win because my name is on your result—and I genuinely want to see you succeed. Especially another Jew.',
  },
  {
    question: 'What happens on the strategy call?',
    answer:
      'We get honest about your goals, your schedule, and what has not worked before. If coaching makes sense, I will tell you. If it does not, I will tell you that too.  Just a straight conversation.',
  },
  {
    question: 'How fast will I see results?',
    answer:
      'Most people start seeing results within the first couple of weeks. It depends on the person and their situation, but things move surprisingly fast when you have a truly personalized system and real accountability.',
  },
];
