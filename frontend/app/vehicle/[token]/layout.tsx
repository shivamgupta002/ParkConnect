export default function PublicVehicleLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-50 blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-sky-50 blur-3xl opacity-60" />
      </div>

      <div className="relative">{children}</div>
    </main>
  );
}