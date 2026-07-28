"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-gradient-to-b from-sky-50 to-teal-50">
      <style jsx global>{`
        @keyframes blobFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -15px) scale(1.05);
          }
          66% {
            transform: translate(-15px, 10px) scale(0.97);
          }
        }
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Decorative floating gradient blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl"
        style={{ animation: "blobFloat 9s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
        style={{ animation: "blobFloat 11s ease-in-out infinite reverse" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-teal-100/50 blur-2xl"
        style={{ animation: "blobFloat 7s ease-in-out infinite" }}
      />

      <div
        className="relative w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-teal-900/5 border border-sky-100 p-8"
        style={{ animation: "cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </div>
    </main>
  );
}