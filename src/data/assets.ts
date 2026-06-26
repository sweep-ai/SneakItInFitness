import david from '../../assets/men/David.jpeg';
import drew from '../../assets/men/Drew.JPG';
import sam from '../../assets/men/Sam.JPG';
import harrisBanner from '../../assets/testimonial-posters/Harris.jpg';

import drewVideo from '../../assets/testimonials/Drew.mp4';
import elliottVideo from '../../assets/testimonials/Elliott.mp4';
import harrisVideo from '../../assets/testimonials/Harris.mp4';
import isaiahVideo from '../../assets/testimonials/Isaiah.mp4';
import joshVideo from '../../assets/testimonials/Josh.mp4';
import mattVideo from '../../assets/testimonials/Matt.mp4';
import ronVideo from '../../assets/testimonials/Ron.mp4';
import samVideo from '../../assets/testimonials/Sam.mp4';

import ajaPoster from '../../assets/testimonial-posters/Aja.jpg';
import alyssPoster from '../../assets/testimonial-posters/Alyss.jpg';
import avivaPoster from '../../assets/testimonial-posters/Aviva.jpg';
import chrissyPoster from '../../assets/testimonial-posters/Chrissy.jpg';
import drewPoster from '../../assets/testimonial-posters/Drew.jpg';
import elliottPoster from '../../assets/testimonial-posters/Elliott.jpg';
import harrisPoster from '../../assets/testimonial-posters/Harris.jpg';
import heatherPoster from '../../assets/testimonial-posters/Heather.jpg';
import isaiahPoster from '../../assets/testimonial-posters/Isaiah.jpg';
import joshPoster from '../../assets/testimonial-posters/Josh.jpg';
import kristaPoster from '../../assets/testimonial-posters/Krista.jpg';
import mattPoster from '../../assets/testimonial-posters/Matt.jpg';
import mrsSokolPoster from '../../assets/testimonial-posters/MrsSokol.jpg';
import ronPoster from '../../assets/testimonial-posters/Ron.jpg';
import samPoster from '../../assets/testimonial-posters/Sam.jpg';
import vaishaliPoster from '../../assets/testimonial-posters/Vaishali.jpg';

import alyss from '../../assets/women/Alyss.JPG';
import janie from '../../assets/women/Janie.JPG';
import kara from '../../assets/women/Kara.JPG';
import mrsSokol from '../../assets/women/MrsSokol.JPG';
import nelly from '../../assets/women/Nelly.png';

import ajaVideo from '../../assets/testimonials/Aja.mp4';
import alyssVideo from '../../assets/testimonials/Alyss.mp4';
import avivaVideo from '../../assets/testimonials/Aviva.mp4';
import chrissyVideo from '../../assets/testimonials/Chrissy.mp4';
import heatherVideo from '../../assets/testimonials/Heather.mp4';
import kristaVideo from '../../assets/testimonials/Krista.mp4';
import mrsSokolVideo from '../../assets/testimonials/MrsSokol.mp4';
import vaishaliVideo from '../../assets/testimonials/Vaishali.mp4';

import logo from '../../assets/branding/swolekolLogo.png';
import ariHeader from '../../assets/branding/ari_header.webp';
import ariMom from '../../assets/branding/ari_mom.webp';
import ariComp from '../../assets/branding/ari_comp.webp';
import meetingConfirm from '../../assets/post-booking/meeting_confirm.png';
import meetingLink from '../../assets/post-booking/meeting_link.png';

export interface Testimonial {
  src: string;
  name: string;
  stat: string;
}

export const menTestimonials: Testimonial[] = [
  { src: drew, name: 'Drew', stat: 'Lost 200 lbs' },
  { src: harrisBanner, name: 'Harris', stat: '-50 lbs in 8 months' },
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
  { src: drewVideo, poster: drewPoster, name: 'Drew', stat: 'Lost 200 lbs' },
  { src: harrisVideo, poster: harrisPoster, name: 'Harris', stat: '-50 lbs in 8 months' },
  { src: samVideo, poster: samPoster, name: 'Sam', stat: '-30 lbs in 3 months' },
  { src: joshVideo, poster: joshPoster, name: 'Josh', stat: '-20 lbs in 3 months' },
  { src: isaiahVideo, poster: isaiahPoster, name: 'Isaiah', stat: '-40 lbs in 4 months' },
  { src: ronVideo, poster: ronPoster, name: 'Ron', stat: '-23 lbs in 6 weeks' },
  { src: mattVideo, poster: mattPoster, name: 'Matt', stat: '-20 lbs in 10 weeks' },
  { src: elliottVideo, poster: elliottPoster, name: 'Elliott', stat: 'Life Transformation in 4 weeks' },
];

export const womenTestimonials: Testimonial[] = [
  { src: kara, name: 'Kara', stat: '-45 lbs in 7 months' },
  { src: kristaPoster, name: 'Krista', stat: '-55 lbs in 5 months' },
  { src: alyss, name: 'Alyss', stat: '-30 lbs in 3 months' },
  { src: janie, name: 'Janie', stat: '-35 lbs in 6 months' },
  { src: mrsSokol, name: 'Roni (My Mom)', stat: '-50 lbs in 8 months' },
  { src: nelly, name: 'Nelly', stat: '-25 lbs in 3 months' },
];

export const womenClientStories: ClientStoryVideo[] = [
  { src: kristaVideo, poster: kristaPoster, name: 'Krista', stat: '-60 lbs in 6 months' },
  { src: ajaVideo, poster: ajaPoster, name: 'Aja', stat: '-60 lbs in 6 months' },
  { src: mrsSokolVideo, poster: mrsSokolPoster, name: 'Roni (My Mom)', stat: '-50 lbs in 8 months' },
  { src: alyssVideo, poster: alyssPoster, name: 'Alyss', stat: '-30 lbs in 3 months' },
  { src: vaishaliVideo, poster: vaishaliPoster, name: 'Vaishali', stat: '-13 lbs in 8 weeks' },
  { src: heatherVideo, poster: heatherPoster, name: 'Heather', stat: '-20 lbs in 3 months' },
  { src: chrissyVideo, poster: chrissyPoster, name: 'Chrissy', stat: '6 month full body transformation' },
  { src: avivaVideo, poster: avivaPoster, name: 'Aviva', stat: '-12 lbs in 5 weeks' },
];

function interleave<T>(first: T[], second: T[]): T[] {
  const merged: T[] = [];
  const length = Math.max(first.length, second.length);
  for (let index = 0; index < length; index += 1) {
    if (index < first.length) merged.push(first[index]);
    if (index < second.length) merged.push(second[index]);
  }
  return merged;
}

export const allClientStories: ClientStoryVideo[] = interleave(
  menClientStories,
  womenClientStories
);

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
