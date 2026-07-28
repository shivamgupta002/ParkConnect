export interface CallRecord {
  id: string;
  vehicle: string; // vehicle id, or populated object depending on your backend response
  status:
    | "initiating"
    | "ringing"
    | "in-progress"
    | "completed"
    | "no-answer"
    | "failed";
  duration_seconds: number | null;
  created_at: string;
}