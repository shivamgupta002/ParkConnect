export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-teal-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-sky-100 p-8">
        {children}
      </div>
    </main>
  );
}