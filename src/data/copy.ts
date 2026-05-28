export type CopyVariant = 'neutral' | 'male' | 'female';
export type FunnelConcept = 'cultural' | 'work' | 'systems' | 'food' | 'yoyo';
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
    headline: "You don't need more discipline. You need a system that fits your real life.",
    subhead:
      'Between work, family, and everything else on your plate, fitness keeps losing. I built the Sneak-it-in System for men who are done restarting and ready to feel strong, lean, and proud again.',
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
      headline: "Every week you start over. Shabbat hits. The plan falls apart again.",
      subhead:
        "That is not a you problem. That is a plan problem. Generic programs were never built for kosher living, holidays, or a home that runs on Jewish time. I design yours around your week so your faith and your goals stop feeling like they are at war.",
    },
  },
  work: {
    female: {
      headline: "You are exhausted after work. So your health continues to takes a backseat.",
      subhead:
        "You are not lazy. You are running on empty. I work with women who hold down full time jobs, carry stress home, and still want to feel lean, strong, healthy,and proud. We build a system around your hours, not some fantasy schedule.",
    },
    male: {
      headline: "You are exhausted after work. So your health continues to takes a backseat.",
      subhead:
        "You are not lazy. You are running on empty. I work with men who hold down full time jobs, carry stress home, and still want to feel lean, strong, healthy,and proud. We build a system around your hours, not some fantasy schedule.",
    },
  },
  systems: {
    female: {
      headline: "You are putting in effort. But your body still is not changing. Here is why.",
      subhead:
        "Most women I coach are not failing because they do not care. They are failing because they lack correct sustainable structure and someone keeping them honest. We fix that first. Confidence comes when you stop restarting every month.",
    },
    male: {
      headline: "You are putting in effort. But your body still is not changing. Here is why.",
      subhead:
        "Most men I coach are not failing because they do not care. They are failing because they lack correct sustainable structure and someone keeping them honest. We fix that first. Confidence comes when you stop restarting every month.",
    },
  },
  food: {
    female: {
      headline: "You Don't Need To Sacrifice Your Favorite Foods to Get In Shape",
      subhead:
        'Every week you start over after Friday night. That is not a willpower problem. Your plan treats Shabbat like a cheat day. I help you eat with your family, keep kosher, and stay on track. No pretending challah does not exist. A system built for your real week.',
    },
    male: {
      headline: "You Don't Need To Sacrifice Your Favorite Foods to Get In Shape",
      subhead:
        'Every week you start over after Friday night. That is not a willpower problem. Your plan treats Shabbat like a cheat day. I help you eat with your family, keep kosher, and stay on track. No pretending challah does not exist. A system built for your real week.',
    },
  },
  yoyo: {
    female: {
      headline: 'You are not the problem. The restrictive plans were.',
      subhead:
        'Meal plans that fight your life are why you keep losing progress and starting over. I work with women who are tired of being harder on themselves than the program was on them. We build a system around your week so staying on track feels easier, not like another full-time job.',
    },
    male: {
      headline: 'You are not the problem. The restrictive plans were.',
      subhead:
        'Meal plans that fight your life are why you keep losing progress and starting over. I work with men who are tired of being harder on themselves than the program was on them. We build a system around your week so staying on track feels easier, not like another full-time job. Crash cuts. Chicken and rice forever. Guilt every weekend. That is how you lose weight and gain it back, not how you actually change. I build systems for men who are done white-knuckling it. More structure, less punishment. Built around your job, your schedule, and your actual life.',
    },
  },
};

export const foodFunnelCopy: FunnelCopy = {
  headline: 'What I eat on Shabbat and still hit my macros.',
  subhead:
    'This is the food demo angle built for Jewish life. Kosher kitchens, family meals, Friday night. Watch how the Sneak-it-in System fits Shabbat into your week so you stop undoing the whole cut every weekend. No BS.',
};

export const yoyoFunnelCopy: FunnelCopy = {
  headline: 'Done with losing weight just to gain it back?',
  subhead:
    'Most programs fail because they are too restrictive for real life. The Sneak-it-in System fits your schedule, your family, and your culture so you stop the restart cycle. No starvation mindset. No BS. Pick the page that fits you below.',
};

export const bookingCopy = {
  headline: 'Book your Sneak-it-in Strategy Call',
  subhead:
    'Pick a time below. Come as you are. We will talk about your week, what has been getting in the way, and what you actually want to change. If we are a fit, great. If not, that is fine too.',
};

export const postBookingCopy = {
  headline: 'Watch this before your call',
  subhead:
    'The video below dives deep in to my backstory - who I am, what I do, why I do it, and how I do it',
};

export const testimonialSectionTitle = 'Take their word for it';

export const finalCtaCopy = {
  headline: 'Ready to stop restarting?',
  subhead:
    'If you have watched the video and seen the results, the next step is simple. Book a strategy call and we will see if this is the right fit for your life.',
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
