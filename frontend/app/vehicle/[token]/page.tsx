// frontend/app/vehicle/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface VehiclePublicInfo {
  vehicle_type: string;
  brand: string;
  model: string;
  color: string;
  is_active: boolean;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const panelVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

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
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-teal-200 border-t-teal-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          This QR code is no longer active
        </h1>
        <p className="text-slate-500 text-sm">
          It may have been removed or replaced by the vehicle owner.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="flex-1">
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            {/* signal pulse — the tag is "listening" */}
            <motion.span
              className="absolute inset-0 rounded-2xl bg-teal-400"
              animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 text-3xl">
              {vehicle.vehicle_type === "bike" ? "🏍️" : "🚗"}
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 capitalize">
            {vehicle.color} {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-slate-500 capitalize">{vehicle.vehicle_type}</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <CallOwnerSection token={params.token} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ReportSection token={params.token} />
        </motion.div>
      </div>

      <motion.footer variants={fadeUp} className="text-center pt-8 pb-2">
        <a href="/" className="text-xs text-slate-400">
          Powered by ParkConnect
        </a>
      </motion.footer>
    </motion.div>
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
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="cta"
            onClick={() => setOpen(true)}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 active:bg-teal-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            📞 Call Owner
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
              <AnimatePresence mode="wait">
                {status === "connected" ? (
                  <motion.div
                    key="connected"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-2"
                  >
                    <motion.div
                      className="mx-auto mb-2 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <span className="text-teal-700">✓</span>
                    </motion.div>
                    <p className="text-teal-700 font-medium">
                      Connecting your call… you should receive it shortly.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-sm text-slate-600 mb-2">
                      Enter your phone number so we can connect your call
                    </p>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 mb-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                    />
                    <AnimatePresence>
                      {status === "error" && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-600 mb-2 overflow-hidden"
                        >
                          {errorMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <motion.button
                      onClick={handleCall}
                      disabled={status === "calling" || phone.length < 8}
                      className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium disabled:opacity-60 relative overflow-hidden"
                      whileTap={{ scale: 0.98 }}
                    >
                      {status === "calling" ? (
                        <span className="inline-flex items-center gap-2">
                          <motion.span
                            className="w-2 h-2 rounded-full bg-white"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          Connecting your call…
                        </span>
                      ) : (
                        "Call Now"
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-teal-50 rounded-2xl p-5 border border-teal-100 text-center"
      >
        <motion.div
          className="mx-auto mb-2 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <span className="text-teal-700">✓</span>
        </motion.div>
        <p className="text-teal-800 font-medium">Report submitted.</p>
        {isUrgent && (
          <p className="text-sm text-teal-700 mt-1">
            The owner will be notified immediately.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="cta"
            onClick={() => setOpen(true)}
            className="w-full py-3 rounded-2xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            ⚠️ Report an issue
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="overflow-hidden"
          >
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

              <AnimatePresence>
                {isUrgent && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2 mb-3 overflow-hidden"
                  >
                    The owner will be notified immediately.
                  </motion.p>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-600 mb-2 overflow-hidden"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleSubmit}
                disabled={submitting || message.trim().length === 0}
                className="w-full py-3 rounded-xl bg-slate-800 text-white font-medium disabled:opacity-60"
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? "Submitting…" : "Submit report"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}