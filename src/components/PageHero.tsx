interface PageHeroProps {
  headline: string;
  subhead: string;
}

export function PageHero({ headline, subhead }: PageHeroProps) {
  return (
    <header className="page-hero">
      <h1>{headline}</h1>
      <p className="subhead">{subhead}</p>
    </header>
  );
}
