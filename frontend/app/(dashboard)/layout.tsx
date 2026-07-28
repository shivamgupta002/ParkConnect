"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, History, ParkingSquare } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/history", label: "Call History", icon: History },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-sky-50/40">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-sky-100 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-1 py-2">
          <div
            className="flex items-center gap-1.5 mr-4 shrink-0"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <ParkingSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800 hidden sm:inline">
              ParkConnect
            </span>
          </div>

          <div className="flex gap-1 text-sm">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-teal-700"
                      : "text-slate-500 hover:text-teal-700"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isActive ? "" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="hidden sm:inline">{label}</span>
                  {isActive && (
                    <span
                      className="absolute inset-0 -z-10 rounded-lg bg-teal-50"
                      style={{ animation: "fadeIn 0.25s ease-out" }}
                    />
                  )}
                  {isActive && (
                    <span className="absolute left-2 right-2 -bottom-[9px] h-0.5 rounded-full bg-teal-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
}