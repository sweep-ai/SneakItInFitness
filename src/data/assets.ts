import david from '../../assets/men/David.jpeg';
import drew from '../../assets/men/Drew.JPG';
import isaiah from '../../assets/men/Isaiah.jpg';
import josh from '../../assets/men/Josh.jpg';
import sam from '../../assets/men/Sam.JPG';

import drewVideo from '../../assets/testimonials/Drew.mp4';
import isaiahVideo from '../../assets/testimonials/Isaiah.mp4';
import joshVideo from '../../assets/testimonials/Josh.mp4';
import samVideo from '../../assets/testimonials/Sam.mp4';

import aja from '../../assets/women/Aja.jpg';
import alyss from '../../assets/women/Alyss.JPG';
import janie from '../../assets/women/Janie.JPG';
import krista from '../../assets/women/Krista.jpg';
import mrsSokol from '../../assets/women/MrsSokol.JPG';
import nelly from '../../assets/women/Nelly.png';

import ajaVideo from '../../assets/testimonials/Aja.mp4';
import alyssVideo from '../../assets/testimonials/Alyss.mp4';
import kristaVideo from '../../assets/testimonials/Krista.mp4';
import mrsSokolVideo from '../../assets/testimonials/MrsSokol.mp4';

import logo from '../../assets/branding/swolekolLogo.png';
import ariHeader from '../../assets/branding/ari_header.png';
import ariMom from '../../assets/branding/ari_mom.png';
import ariComp from '../../assets/branding/ari_comp.png';
import meetingConfirm from '../../assets/post-booking/meeting_confirm.png';
import meetingLink from '../../assets/post-booking/meeting_link.png';

export interface Testimonial {
  src: string;
  name: string;
  stat: string;
}

const harris = '/assets/men/Harris.png';

export const menTestimonials: Testimonial[] = [
  { src: drew, name: 'Drew', stat: 'Lost 200 lbs' },
  { src: harris, name: 'Harris', stat: '-50 lbs in 8 months' },
  { src: sam, name: 'Sam', stat: '-30 lbs in 3 months' },
  { src: david, name: 'David', stat: '-45 lbs in 6 months' },
];

export interface ClientStoryVideo {
  src: string;
  poster: string;
  name: string;
  stat: string;
}

export const menClientStories: ClientStoryVideo[] = [
  { src: drewVideo, poster: drew, name: 'Drew', stat: 'Lost 200 lbs' },
  { src: samVideo, poster: sam, name: 'Sam', stat: '-30 lbs in 3 months' },
  { src: joshVideo, poster: josh, name: 'Josh', stat: '-20 lbs in 3 months' },
  { src: isaiahVideo, poster: isaiah, name: 'Isaiah', stat: '-40 lbs in 4 months' },
];

export const womenTestimonials: Testimonial[] = [
  { src: alyss, name: 'Alyss', stat: '-30 lbs in 3 months' },
  { src: janie, name: 'Janie', stat: '-35 lbs in 6 months' },
  { src: mrsSokol, name: 'Roni (My Mom)', stat: '-50 lbs in 8 months' },
  { src: nelly, name: 'Nelly', stat: '-25 lbs in 3 months' },
];

export const womenClientStories: ClientStoryVideo[] = [
  { src: kristaVideo, poster: krista, name: 'Krista', stat: '-50 lbs in 4 months' },
  { src: ajaVideo, poster: aja, name: 'Aja', stat: '-60 lbs in 6 months' },
  { src: mrsSokolVideo, poster: mrsSokol, name: 'Roni (My Mom)', stat: '-50 lbs in 8 months' },
  { src: alyssVideo, poster: alyss, name: 'Alyss', stat: '-30 lbs in 3 months' },
];

export const logoSrc = logo;
export const ariHeaderSrc = ariHeader;
export const ariMomSrc = ariMom;
export const ariCompSrc = ariComp;
export const meetingConfirmSrc = meetingConfirm;
export const meetingLinkSrc = meetingLink;

export const heroBackgroundPhotos = [
  ...menTestimonials.map((t) => t.src),
  ...womenTestimonials.map((t) => t.src),
];
