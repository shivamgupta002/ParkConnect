// frontend/app/(dashboard)/vehicles/[id]/qr/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface QrResult {
  token: string;
  qr_image_url: string;
}

export default function VehicleQrPage() {
  const params = useParams<{ id: string }>();

  const [qr, setQr] = useState<QrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleLabel, setVehicleLabel] = useState("");

  // On load: fetch the vehicle and check if it already has a QR code.
  // If so, show it immediately instead of requiring a click.
  useEffect(() => {
    fetch(`/api/vehicles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicleLabel(`${data.color} ${data.brand} ${data.model}`);

        // Try a few likely shapes depending on how the backend nests it.
        const existingUrl =
          data.qr_image_url ??
          data.qr_code_id?.qr_image_url ??
          data.qr_code?.qr_image_url ??
          null;
        const existingToken =
          data.qr_token ?? data.qr_code_id?.token ?? data.qr_code?.token ?? "";

        if (existingUrl) {
          setQr({ qr_image_url: existingUrl, token: existingToken });
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [params.id]);

  const generateQr = async (isRegenerate: boolean) => {
    if (
      isRegenerate &&
      !confirm(
        "Generating a new QR code will invalidate the old sticker. Continue?",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/vehicles/${params.id}/qr`, {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || "Could not generate QR code.");
      }

      setQr(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">
      <div className="max-w-md mx-auto rounded-2xl border border-sky-100 bg-white p-8 text-center">
        <Link
          href="/vehicles"
          className="mb-4 inline-block text-sm text-teal-700"
        >
          ← Back to vehicles
        </Link>

        <h1 className="mb-1 text-2xl font-semibold text-slate-900">QR Code</h1>

        {vehicleLabel && <p className="mb-6 text-slate-500">{vehicleLabel}</p>}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-left text-sm text-red-700">
            {error}
          </div>
        )}

        {qr ? (
          <>
            <img
              src={qr.qr_image_url}
              alt="Vehicle QR code"
              className="mx-auto mb-4 h-56 w-56 rounded-xl border border-slate-200"
            />

            <div className="mb-4 flex justify-center gap-3">
              <a
                href={qr.qr_image_url}
                download={`parkconnect-qr-${qr.token || params.id}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Download
              </a>

              <button
                onClick={() => generateQr(true)}
                disabled={loading}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "…" : "Regenerate"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Reprinting invalidates the old sticker—it will stop working once
              you regenerate.
            </p>
          </>
        ) : (
          <button
            onClick={() => generateQr(false)}
            disabled={loading}
            className="rounded-xl bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate QR code"}
          </button>
        )}
      </div>
    </div>
  );
}
