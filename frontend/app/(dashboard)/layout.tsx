import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-sky-100 px-4 py-3 flex gap-4 text-sm">
        <Link href="/dashboard" className="text-slate-600 hover:text-teal-700">
          Dashboard
        </Link>
        <Link href="/vehicles" className="text-slate-600 hover:text-teal-700">
          Vehicles
        </Link>
        <Link href="/history" className="text-slate-600 hover:text-teal-700">
          Call History
        </Link>
      </nav>
      {children}
    </div>
  );
}