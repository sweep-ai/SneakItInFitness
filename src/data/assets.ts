import david from '../../assets/men/David.jpeg';
import sam from '../../assets/men/Sam.JPG';
import drewBanner from '../../assets/men/Drew.JPG';
import connorBanner from '../../assets/men/Connor.jpg';
import tylerBanner from '../../assets/men/Tyler.jpg';
import isaiahBanner from '../../assets/men/Isaiah.jpg';
import elliotBanner from '../../assets/men/Elliot.jpg';
import mattBanner from '../../assets/men/Matt.jpg';
import chelsieBanner from '../../assets/women/Chelsie.jpg';
import erinBanner from '../../assets/women/Erin.jpg';
import harrisBanner from '../../assets/testimonial-posters/Harris.jpg';

import elliottVideo from '../../assets/testimonials/Elliott.mp4';
import harrisVideo from '../../assets/testimonials/Harris.mp4';
import isaiahVideo from '../../assets/testimonials/Isaiah.mp4';
import jonathanVideo from '../../assets/testimonials/Jonathan.mp4';
import joshVideo from '../../assets/testimonials/Josh.mp4';
import mattVideo from '../../assets/testimonials/Matt.mp4';
import rabbiMattVideo from '../../assets/testimonials/RabbiMatt.mp4';
import ronVideo from '../../assets/testimonials/Ron.mp4';
import samVideo from '../../assets/testimonials/Sam.mp4';
import tobyVideo from '../../assets/testimonials/Toby.mp4';
import tylerVideo from '../../assets/testimonials/Tyler.mp4';

import ajaPoster from '../../assets/testimonial-posters/Aja.jpg';
import alyssPoster from '../../assets/testimonial-posters/Alyss.jpg';
import avivaPoster from '../../assets/testimonial-posters/Aviva.jpg';
import chrissyPoster from '../../assets/testimonial-posters/Chrissy.jpg';
import elliottPoster from '../../assets/testimonial-posters/Elliott.jpg';
import erinPoster from '../../assets/testimonial-posters/Erin.jpg';
import gracePoster from '../../assets/testimonial-posters/Grace.jpg';
import harrisPoster from '../../assets/testimonial-posters/Harris.jpg';
import heatherPoster from '../../assets/testimonial-posters/Heather.jpg';
import isaiahPoster from '../../assets/testimonial-posters/Isaiah.jpg';
import jonathanPoster from '../../assets/testimonial-posters/Jonathan.jpg';
import joshPoster from '../../assets/testimonial-posters/Josh.jpg';
import kristaPoster from '../../assets/testimonial-posters/Krista.jpg';
import mattPoster from '../../assets/testimonial-posters/Matt.jpg';
import mrsSokolPoster from '../../assets/testimonial-posters/MrsSokol.jpg';
import rabbiMattPoster from '../../assets/testimonial-posters/RabbiMatt.jpg';
import rivkiePoster from '../../assets/testimonial-posters/Rivkie.jpg';
import ronPoster from '../../assets/testimonial-posters/Ron.jpg';
import samPoster from '../../assets/testimonial-posters/Sam.jpg';
import tobyPoster from '../../assets/testimonial-posters/Toby.jpg';
import tylerPoster from '../../assets/testimonial-posters/Tyler.jpg';
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
import erinVideo from '../../assets/testimonials/Erin.mp4';
import graceVideo from '../../assets/testimonials/Grace.mp4';
import heatherVideo from '../../assets/testimonials/Heather.mp4';
import kristaVideo from '../../assets/testimonials/Krista.mp4';
import mrsSokolVideo from '../../assets/testimonials/MrsSokol.mp4';
import rivkieVideo from '../../assets/testimonials/rivkie.mp4';
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
  { src: harrisBanner, name: 'Harris', stat: 'Lost 50 lbs in 8 months' },
  { src: sam, name: 'Sam', stat: 'Lost 30 lbs in 3 months' },
  { src: david, name: 'David', stat: 'Lost 45 lbs in 6 months' },
  { src: drewBanner, name: 'Drew', stat: 'Lost 150 lbs in 18 months' },
  { src: connorBanner, name: 'Tyler', stat: 'Lost 80 lbs in 8 months' },
  { src: tylerBanner, name: 'Matt', stat: 'Lost 20 lbs in 3 months' },
  { src: isaiahBanner, name: 'Isaiah', stat: 'Lost 50 lbs in 6 months' },
  { src: elliotBanner, name: 'Connor', stat: 'Lost 20 lbs in 3 months' },
  { src: mattBanner, name: 'Elliott', stat: 'Body recomposition in 3 months' },
];

export interface ClientStoryVideo {
  src: string;
  poster: string;
  name: string;
  stat: string;
}

export const menClientStories: ClientStoryVideo[] = [
  { src: tylerVideo, poster: tylerPoster, name: 'Tyler', stat: 'Lost 80 lbs in 8 months' },
  { src: harrisVideo, poster: harrisPoster, name: 'Harris', stat: 'Lost 50 lbs in 8 months' },
  { src: samVideo, poster: samPoster, name: 'Sam', stat: 'Lost 30 lbs in 3 months' },
  { src: joshVideo, poster: joshPoster, name: 'Josh', stat: 'Lost 20 lbs in 3 months' },
  { src: isaiahVideo, poster: isaiahPoster, name: 'Isaiah', stat: 'Lost 40 lbs in 4 months' },
  { src: ronVideo, poster: ronPoster, name: 'Ron', stat: 'Lost 23 lbs in 6 weeks' },
  { src: mattVideo, poster: mattPoster, name: 'Elliott', stat: 'Life Transformation in 4 weeks' },
  { src: elliottVideo, poster: elliottPoster, name: 'Connor', stat: 'Lost 20 lbs in 3 months' },
  { src: rabbiMattVideo, poster: rabbiMattPoster, name: 'Rabbi Matt', stat: 'Lost 20 lbs in 3 months' },
  { src: jonathanVideo, poster: jonathanPoster, name: 'Jonathan', stat: 'Lost 20 lbs in 60 days' },
  { src: tobyVideo, poster: tobyPoster, name: 'Toby', stat: 'Lost 20 lbs in 5 months' },
];

export const womenTestimonials: Testimonial[] = [
  { src: kara, name: 'Kara', stat: 'Lost 45 lbs in 7 months' },
  { src: kristaPoster, name: 'Krista', stat: 'Lost 55 lbs in 5 months' },
  { src: alyss, name: 'Alyss', stat: 'Lost 30 lbs in 3 months' },
  { src: janie, name: 'Janie', stat: 'Lost 35 lbs in 6 months' },
  { src: mrsSokol, name: 'Roni (My Mom)', stat: 'Lost 50 lbs in 8 months' },
  { src: nelly, name: 'Nelly', stat: 'Lost 25 lbs in 3 months' },
  { src: chelsieBanner, name: 'Chelsie', stat: 'Lost 15 lbs in 90 days' },
  { src: erinBanner, name: 'Erin', stat: 'Lost 15 lbs in 3 months' },
];

export const womenClientStories: ClientStoryVideo[] = [
  { src: kristaVideo, poster: kristaPoster, name: 'Krista', stat: 'Lost 60 lbs in 6 months' },
  { src: ajaVideo, poster: ajaPoster, name: 'Aja', stat: 'Lost 60 lbs in 6 months' },
  { src: mrsSokolVideo, poster: mrsSokolPoster, name: 'Roni (My Mom)', stat: 'Lost 50 lbs in 8 months' },
  { src: alyssVideo, poster: alyssPoster, name: 'Alyss', stat: 'Lost 30 lbs in 3 months' },
  { src: erinVideo, poster: erinPoster, name: 'Kara', stat: 'Lost 45 lbs in 7 months' },
  { src: rivkieVideo, poster: rivkiePoster, name: 'Rivkie', stat: 'Lost 10 lbs in 45 days' },
  { src: vaishaliVideo, poster: vaishaliPoster, name: 'Vaishali', stat: 'Lost 13 lbs in 8 weeks' },
  { src: heatherVideo, poster: heatherPoster, name: 'Heather', stat: 'Lost 20 lbs in 3 months' },
  { src: chrissyVideo, poster: chrissyPoster, name: 'Chrissy', stat: '6 month full body transformation' },
  { src: avivaVideo, poster: avivaPoster, name: 'Aviva', stat: 'Lost 12 lbs in 5 weeks' },
  { src: graceVideo, poster: gracePoster, name: 'Grace', stat: 'Lost 20 lbs in 60 days' },
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
