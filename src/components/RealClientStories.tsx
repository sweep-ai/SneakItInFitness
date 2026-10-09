import type { ClientStoryVideo } from '../data/assets';
import { LazyClientVideo } from './LazyClientVideo';
import { SectionTitle } from './SectionTitle';
import './RealClientStories.css';

interface RealClientStoriesProps {
  stories: ClientStoryVideo[];
  title?: string;
  hideTitle?: boolean;
}

export function RealClientStories({
  stories,
  title = 'Real Client Stories',
  hideTitle = false,
}: RealClientStoriesProps) {
  return (
    <section className="client-stories-section section" aria-label={title}>
      {!hideTitle && <SectionTitle>{title}</SectionTitle>}
      <div className="client-stories-list">
        {stories.map((story) => (
          <article key={story.name} className="client-story-card">
            <LazyClientVideo story={story} />
            <div className="client-story-caption">
              <p className="client-story-name">{story.name}</p>
              <p className="client-story-stat">{story.stat}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
