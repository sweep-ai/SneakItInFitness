import type { ReactNode } from 'react';
import { heroBackgroundPhotos } from '../data/assets';
import './PageHero.css';

interface PageHeroProps {
  headline: string;
  headlineHighlight?: string | string[];
  headlineUnderline?: string | string[];
  subhead: string;
}

function toPhraseList(value?: string | string[]): string[] {
  return (Array.isArray(value) ? value : value ? [value] : []).filter((phrase) => phrase.length > 0);
}

function findRanges(line: string, phrases: string[]): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const phrase of phrases) {
    let from = 0;
    while (from < line.length) {
      const index = line.indexOf(phrase, from);
      if (index === -1) break;
      ranges.push({ start: index, end: index + phrase.length });
      from = index + phrase.length;
    }
  }
  return ranges;
}

function covers(ranges: Array<{ start: number; end: number }>, start: number, end: number) {
  return ranges.some((range) => start >= range.start && end <= range.end);
}

function renderMarkedLine(
  line: string,
  highlights?: string | string[],
  underlines?: string | string[],
  lineKey = 0,
) {
  const highlightRanges = findRanges(line, toPhraseList(highlights).filter((phrase) => line.includes(phrase)));
  const underlineRanges = findRanges(line, toPhraseList(underlines).filter((phrase) => line.includes(phrase)));

  if (highlightRanges.length === 0 && underlineRanges.length === 0) {
    return line;
  }

  const bounds = new Set<number>([0, line.length]);
  for (const range of [...highlightRanges, ...underlineRanges]) {
    bounds.add(range.start);
    bounds.add(range.end);
  }

  const points = [...bounds].sort((a, b) => a - b);
  const parts: ReactNode[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const text = line.slice(start, end);
    if (!text) continue;

    const isHighlight = covers(highlightRanges, start, end);
    const isUnderline = covers(underlineRanges, start, end);

    if (!isHighlight && !isUnderline) {
      parts.push(text);
      continue;
    }

    const className = [
      isHighlight ? 'page-hero-headline-emphasis' : '',
      isUnderline ? 'page-hero-headline-underline' : '',
    ]
      .filter(Boolean)
      .join(' ');

    parts.push(
      <span key={`${lineKey}-${start}-${end}`} className={className}>
        {text}
      </span>,
    );
  }

  return parts;
}

function renderMarkedHeadline(
  headline: string,
  highlights?: string | string[],
  underlines?: string | string[],
) {
  return headline.split('\n').flatMap((line, lineIndex) =>
    lineIndex === 0
      ? [renderMarkedLine(line, highlights, underlines, lineIndex)]
      : [
          <br key={`headline-br-${lineIndex}`} />,
          renderMarkedLine(line, highlights, underlines, lineIndex),
        ],
  );
}

export function PageHero({ headline, headlineHighlight, headlineUnderline, subhead }: PageHeroProps) {
  const gridPhotos = Array.from({ length: 24 }, (_, index) => heroBackgroundPhotos[index % heroBackgroundPhotos.length]);

  return (
    <header className="page-hero">
      <div className="page-hero-bg" aria-hidden="true">
        <div className="page-hero-photo-grid">
          {gridPhotos.map((src, index) => (
            <img key={`${src}-${index}`} src={src} alt="" loading="lazy" />
          ))}
        </div>
        <div className="page-hero-overlay" />
      </div>

      <div className="page-hero-inner">
        <div className="page-hero-copy">
          <h1 className="page-hero-headline">
            {renderMarkedHeadline(headline, headlineHighlight, headlineUnderline)}
          </h1>
          <p className="page-hero-subhead">{subhead}</p>
        </div>
      </div>
    </header>
  );
}
