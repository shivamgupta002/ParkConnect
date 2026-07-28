// frontend/app/(dashboard)/vehicles/[id]/qr/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, QrCode, Check } from "lucide-react";

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
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetch(`/api/vehicles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicleLabel(`${data.color} ${data.brand} ${data.model}`);

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

      setQr(null);
      // slight delay so the "generating" -> new QR feels like a fresh reveal
      setTimeout(() => setQr(json), 50);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes qrReveal {
          from {
            opacity: 0;
            transform: scale(0.85) rotate(-4deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes checkPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {checking ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <div
            className="h-9 w-9 rounded-full border-[3px] border-sky-200 border-t-teal-500"
            style={{ animation: "spin 0.7s linear infinite" }}
          />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      ) : (
        <div
          className="max-w-md mx-auto rounded-2xl border border-sky-100 bg-white p-8 text-center"
          style={{ animation: "cardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <Link
            href="/vehicles"
            className="group mb-4 inline-flex items-center gap-1 text-sm text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to vehicles
          </Link>

          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50"
            style={{ animation: "fadeIn 0.4s ease-out" }}
          >
            <QrCode className="h-5 w-5 text-teal-600" />
          </div>

          <h1 className="mb-1 text-2xl font-semibold text-slate-900">QR Code</h1>

          {vehicleLabel && (
            <p className="mb-6 text-slate-500" style={{ animation: "fadeIn 0.4s ease-out 60ms both" }}>
              {vehicleLabel}
            </p>
          )}

          {error && (
            <div
              className="mb-4 rounded-lg bg-red-50 p-3 text-left text-sm text-red-700"
              style={{ animation: "shake 0.4s ease-in-out" }}
            >
              {error}
            </div>
          )}

          {loading && !qr && (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div
                className="h-8 w-8 rounded-full border-[3px] border-teal-100 border-t-teal-500"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
              <p className="text-sm text-slate-400">Generating QR code…</p>
            </div>
          )}

          {qr && !loading ? (
            <div style={{ animation: "fadeIn 0.3s ease-out" }}>
              <img
                key={qr.qr_image_url}
                src={qr.qr_image_url}
                alt="Vehicle QR code"
                className="mx-auto mb-4 h-56 w-56 rounded-xl border border-slate-200 shadow-sm"
                style={{ animation: "qrReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />

              <div className="mb-4 flex justify-center gap-3">
                
                  <a
                  href={qr.qr_image_url}
                  download={`parkconnect-qr-${qr.token || params.id}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDownloadClick}
                  className="relative overflow-hidden rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-700 active:scale-95 flex items-center gap-1.5"
                >
                  {downloaded ? (
                    <span
                      className="flex items-center gap-1.5"
                      style={{ animation: "checkPop 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Downloaded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </span>
                  )}
                </a>

                <button
                    onClick={() => generateQr(true)}
                    disabled={loading}
                    className="group rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                  <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Reprinting invalidates the old sticker—it will stop working once
                you regenerate.
              </p>
            </div>
          ) : !loading && !qr ? (
            <button
              onClick={() => generateQr(false)}
              disabled={loading}
              className="rounded-xl bg-teal-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-teal-700 active:scale-95 disabled:opacity-60 shadow-sm shadow-teal-900/10"
              style={{ animation: "fadeIn 0.4s ease-out 100ms both" }}
            >
              Generate QR code
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}