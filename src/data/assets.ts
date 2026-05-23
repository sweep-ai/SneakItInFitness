import connor from '../../assets/men/Connor.png';
import david from '../../assets/men/David.jpeg';
import drew from '../../assets/men/Drew.JPG';
import sam from '../../assets/men/Sam.JPG';

import drewVideo from '../../assets/testimonials/Drew.mp4';
import samVideo from '../../assets/testimonials/Sam.mp4';
import connorVideo from '../../assets/testimonials/Connor.mp4';

import alyss from '../../assets/women/Alyss.JPG';
import janie from '../../assets/women/Janie.JPG';
import kara from '../../assets/women/Kara.JPG';
import mrsSokol from '../../assets/women/MrsSokol.JPG';
import nelly from '../../assets/women/Nelly.png';

import karaVideo from '../../assets/testimonials/Kara.mp4';
import mrsSokolVideo from '../../assets/testimonials/MrsSokol.mp4';
import alyssVideo from '../../assets/testimonials/Alyss.mp4';

import logo from '../../assets/branding/swolekolLogo.png';

export interface Testimonial {
  src: string;
  name: string;
  stat: string;
}

export const menTestimonials: Testimonial[] = [
  { src: drew, name: 'Drew', stat: 'Lost 200 lbs' },
  { src: sam, name: 'Sam', stat: '-40 lbs in 5 weeks' },
  { src: david, name: 'David', stat: '-45 lbs in 6 months' },
  { src: connor, name: 'Connor', stat: '-20 lbs in 6 weeks' },
];

export interface ClientStoryVideo {
  src: string;
  poster: string;
  name: string;
  stat: string;
}

export const menClientStories: ClientStoryVideo[] = [
  { src: drewVideo, poster: drew, name: 'Drew', stat: 'Lost 200 lbs' },
  { src: samVideo, poster: sam, name: 'Sam', stat: '-40 lbs in 5 weeks' },
  { src: connorVideo, poster: connor, name: 'Connor', stat: '-20 lbs in 6 weeks' },
];

export const womenTestimonials: Testimonial[] = [
  { src: alyss, name: 'Alyss', stat: '-30 lbs in 3 months' },
  { src: kara, name: 'Kara', stat: '-40 lbs in 6 months' },
  { src: janie, name: 'Janie', stat: '-35 lbs in 6 months' },
  { src: mrsSokol, name: 'Mrs. Sokol', stat: '-50 lbs in 8 months' },
  { src: nelly, name: 'Nelly', stat: '-25 lbs in 3 months' },
];

export const womenClientStories: ClientStoryVideo[] = [
  { src: karaVideo, poster: kara, name: 'Kara', stat: '-40 lbs in 6 months' },
  { src: mrsSokolVideo, poster: mrsSokol, name: 'Mrs. Sokol', stat: '-50 lbs in 8 months' },
  { src: alyssVideo, poster: alyss, name: 'Alyss', stat: '-30 lbs in 3 months' },
];

export const logoSrc = logo;
