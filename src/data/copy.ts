export type CopyVariant = 'neutral' | 'male' | 'female';
export type FunnelConcept = 'cultural' | 'work' | 'systems';
export type FunnelGender = 'male' | 'female';

export interface FunnelCopy {
  headline: string;
  subhead: string;
}

export const funnelCopy: Record<CopyVariant, FunnelCopy> = {
  neutral: {
    headline: "You're trying. You're putting in effort. And you're still not proud of who you see.",
    subhead:
      'I know that feeling. I lived it. The Sneak-it-in System is how I help Jewish men and women stop restarting and finally build a body, and an identity, they are proud of. No BS. Built around your real life.',
  },
  male: {
    headline: "You're eating clean but you're still not lean. Here's why.",
    subhead:
      'Straight up. It is usually not food quality. It is calories, protein, and consistency. I help you build a system around your 9 to 5 so you stop spinning your wheels and start becoming someone you are proud to be.',
  },
  female: {
    headline: "You don't need more discipline. You need a system that fits your real life.",
    subhead:
      'Between work, family, and everything else on your plate, fitness keeps losing. I built the Sneak-it-in System for women who are done restarting and ready to feel strong, lean, and proud again.',
  },
};

export const funnelCopyByConcept: Record<
  FunnelConcept,
  Record<FunnelGender, FunnelCopy>
> = {
  cultural: {
    female: {
      headline: "Every week you start over. Shabbat hits. The plan falls apart again.",
      subhead:
        "That is not a you problem. That is a plan problem. Generic programs were never built for kosher living, holidays, or a home that runs on Jewish time. I design yours around your week so your faith and your goals stop feeling like they are at war.",
    },
    male: {
      headline: "You keep restarting because your plan was not built for Jewish life.",
      subhead:
        "Shabbat. Holidays. Family meals. A kosher kitchen. I am not asking you to pick between your values and your body. I map training and nutrition around the life you actually live. You are meant for more than another failed cut.",
    },
  },
  work: {
    female: {
      headline: "You are exhausted after work. So the gym waits. Again.",
      subhead:
        "You are not lazy. You are running on empty. I work with women who hold down full time jobs, carry stress home, and still want to feel lean, strong, and proud. We build a system around your hours, not some fantasy schedule.",
    },
    male: {
      headline: "What nobody tells you about getting lean while working 60 hours a week.",
      subhead:
        "You eat decent. You train when you can. Results still are not there. Life knocks you off every time you build momentum. Sound familiar? The problem is not effort. You do not have a system built for your actual life. I will help you build one.",
    },
  },
  systems: {
    female: {
      headline: "You are putting in effort. Your body still is not changing. Here is why.",
      subhead:
        "Most women I coach are not failing because they do not care. They are failing because they lack structure and someone keeping them honest. We fix that first. Confidence comes when you stop restarting every month.",
    },
    male: {
      headline: "You're eating clean but you're still not lean. Here's why.",
      subhead:
        "Straight up. It is usually not food quality. It is calories, protein, and consistency. This is not about a six pack. It is about becoming someone who shows up for himself. I have done it. I will show you how.",
    },
  },
};

export const bookingCopy = {
  headline: 'Book your Sneak-it-in Strategy Call',
  subhead:
    'Pick a time below. Come as you are. We will talk about your week, what has been getting in the way, and what you actually want to change. If we are a fit, great. If not, that is fine too.',
};

export const postBookingCopy = {
  headline: 'Watch this before your call',
  subhead:
    'I recorded this so you know exactly what to expect and we do not waste a minute when we talk. Watch it before we meet.',
};

export const testimonialSectionTitle = 'Take their word for it';

export const finalCtaCopy = {
  headline: 'Ready to stop restarting?',
  subhead:
    'If you have watched the video and seen the results, the next step is simple. Book a strategy call and we will see if this is the right fit for your life.',
};

export const prepChecklist = [
  'Confirm the booking email',
  'Come prepared with questions',
  'Come prepared to make a decision',
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
      'That is who I built this for. Not gym rats with empty calendars. We build training and nutrition into the life you already live. Your job, your stress, your real hours. Fitness stops being the thing that always loses.',
  },
  {
    question: 'I have tried programs before and always fall off. Why would this be different?',
    answer:
      'Because most plans ask you to live like someone you are not. I do not do that. You get a system built for your week, and I keep you accountable when life gets messy. That is the difference. Not more motivation. Real structure.',
  },
  {
    question: 'Will this work with Shabbat, holidays, and kosher lifestyle?',
    answer:
      'Yes. That is the point. I map your plan around Jewish life, not against it. Shabbat, holidays, kosher meals. All of it. You should not have to choose between your values and your results.',
  },
  {
    question: 'Is this another crash diet or extreme cut?',
    answer:
      'No. I do not run that. Crash diets are how you end up heavier than when you started. We build habits you can actually keep. Slow, steady, sustainable. The way it should be.',
  },
  {
    question: 'How much support do I actually get?',
    answer:
      'Real 1:1 support. Not a PDF and good luck. You get me. Direct access. Regular check-ins. I adjust your plan when life shifts. I care if you win because my name is on your result.',
  },
  {
    question: 'What happens on the strategy call?',
    answer:
      'We get honest about your goals, your schedule, and what has not worked before. If coaching makes sense, I will tell you. If it does not, I will tell you that too. No hard pitch. Just a straight conversation.',
  },
  {
    question: 'How fast will I see results?',
    answer:
      'I will be real with you. The scale moves when you stop restarting. Mindset and consistency can shift fast once you have a system. We build the person first. The body follows when you finally stick to something.',
  },
];
