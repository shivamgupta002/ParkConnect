"use client";

export default function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium text-base
                 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed
                 transition-colors"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}