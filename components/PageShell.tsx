type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{children}</div>;
}
