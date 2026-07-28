"use client";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}