export const Logos = () => {
  const companies = [
    "Acme Corp",
    "Renard Inc",
    "Echo",
    "Celestial",
    "Pulse",
    "Apex",
    "Zenith",
    "Horizon",
  ];

  return (
    <section className="py-12 border-y" style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--secondary) / 0.1)' }}>
      <p className="text-center text-sm font-semibold mb-8 uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Trusted by cunning engineering teams at
      </p>
      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-16 px-8">
          {companies.map((company, i) => (
            <span
              key={i}
              className="text-xl font-bold select-none"
              style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}
            >
              {company}
            </span>
          ))}
          {companies.map((company, i) => (
            <span
              key={i + companies.length}
              className="text-xl font-bold select-none"
              style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}
            >
              {company}
            </span>
          ))}
        </div>
        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap gap-16 px-8">
          {companies.map((company, i) => (
            <span
              key={i + 20}
              className="text-xl font-bold select-none"
              style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}
            >
              {company}
            </span>
          ))}
          {companies.map((company, i) => (
            <span
              key={i + companies.length + 20}
              className="text-xl font-bold select-none"
              style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}
            >
              {company}
            </span>
          ))}
        </div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r to-transparent" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--background)), transparent)' }}></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l to-transparent" style={{ backgroundImage: 'linear-gradient(to left, hsl(var(--background)), transparent)' }}></div>
      </div>
    </section>
  );
};
