// frontend/app/vehicle/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface VehiclePublicInfo {
  vehicle_type: string;
  brand: string;
  model: string;
  color: string;
  is_active: boolean;
}

export default function PublicVehiclePage() {
  const params = useParams<{ token: string }>();
  const [vehicle, setVehicle] = useState<VehiclePublicInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vehicle/${params.token}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setVehicle(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          This QR code is no longer active
        </h1>
        <p className="text-slate-500 text-sm">
          It may have been removed or replaced by the vehicle owner.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <div className="flex-1">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 mb-4 text-3xl">
            {vehicle.vehicle_type === "bike" ? "🏍️" : "🚗"}
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 capitalize">
            {vehicle.color} {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-slate-500 capitalize">{vehicle.vehicle_type}</p>
        </div>

        <CallOwnerSection token={params.token} />
        <ReportSection token={params.token} />
      </div>

      <footer className="text-center pt-8 pb-2">
        <a href="/" className="text-xs text-slate-400">
          Powered by ParkConnect
        </a>
      </footer>
    </div>
  );
}

function CallOwnerSection({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "calling" | "connected" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCall = async () => {
    setStatus("calling");
    setErrorMsg("");
    try {
      const res = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, scanner_phone: phone }),
      });
      const json = await res.json();
      if (res.status === 429) {
        setStatus("error");
        setErrorMsg("Too many call attempts, please try again in a few minutes.");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.detail || "Could not place the call.");
        return;
      }
      setStatus("connected");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="mb-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-4 rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 active:bg-teal-800"
        >
          📞 Call Owner
        </button>
      ) : (
        <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
          {status === "connected" ? (
            <p className="text-center text-teal-700 font-medium py-2">
              Connecting your call… you should receive it shortly.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-2">
                Enter your phone number so we can connect your call
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 mb-3 text-base"
              />
              {status === "error" && (
                <p className="text-sm text-red-600 mb-2">{errorMsg}</p>
              )}
              <button
                onClick={handleCall}
                disabled={status === "calling" || phone.length < 8}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium disabled:opacity-60"
              >
                {status === "calling" ? "Connecting your call…" : "Call Now"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReportSection({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState("wrong_parking");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isUrgent = reportType === "accident" || reportType === "emergency";

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          report_type: reportType,
          message,
          reporter_contact: contact || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Could not submit report.");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 text-center">
        <p className="text-teal-800 font-medium">Report submitted.</p>
        {isUrgent && (
          <p className="text-sm text-teal-700 mt-1">
            The owner will be notified immediately.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 rounded-2xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
        >
          ⚠️ Report an issue
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-1">Issue type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 mb-3 text-base"
          >
            <option value="wrong_parking">Wrong parking</option>
            <option value="lights_on">Lights on</option>
            <option value="accident">Accident</option>
            <option value="emergency">Emergency</option>
            <option value="other">Other</option>
          </select>

          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 mb-3 text-base"
            placeholder="Describe the issue…"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your contact (optional)
          </label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 mb-3 text-base"
            placeholder="Phone or email"
          />

          {isUrgent && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">
              The owner will be notified immediately.
            </p>
          )}
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || message.trim().length === 0}
            className="w-full py-3 rounded-xl bg-slate-800 text-white font-medium disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </div>
      )}
    </div>
  );
}