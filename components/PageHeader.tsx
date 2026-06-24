type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="py-10">
      <p className="text-sm font-medium uppercase tracking-normal text-arc-blue">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{description}</p>
    </section>
  );
}
