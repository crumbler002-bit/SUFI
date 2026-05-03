"use client";
import { useState } from "react";
import SufiModal from "@/components/ui/SufiModal";
import SufiInput from "@/components/ui/SufiInput";
import SufiButton from "@/components/ui/SufiButton";
import { reservationApi } from "@/lib/api";
import { useAuth } from "@/store/appStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
  onSuccess?: () => void;
}

export default function ReservationModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Please sign in to book a table."); return; }
    setLoading(true);
    setError("");
    try {
      const result = await reservationApi.autoCreate({
        restaurant_id: restaurantId,
        reservation_time: `${date}T${time}:00`,
        guests,
      });
      if (result.status === "waitlisted") {
        setWaitlisted(true);
      } else {
        setConfirmed(true);
        setTimeout(() => { onSuccess?.(); onClose(); setConfirmed(false); }, 2200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SufiModal isOpen={isOpen} onClose={onClose} title={confirmed || waitlisted ? undefined : `Book at ${restaurantName}`}>
      {confirmed ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <p className="font-semibold text-lg">Reservation Confirmed</p>
          <p className="text-sm text-gray-400 mt-1">Details sent to your email.</p>
        </div>
      ) : waitlisted ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
          <p className="font-semibold text-lg">Added to Waitlist</p>
          <p className="text-sm text-gray-400 mt-1">You'll be notified when a table opens up.</p>
          <SufiButton variant="ghost" className="mt-4" onClick={onClose}>Close</SufiButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60"
            >
              {[1,2,3,4,5,6,7,8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
            <SufiInput type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Time</label>
            <SufiInput type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <SufiButton type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</SufiButton>
            <SufiButton type="submit" disabled={loading} className="flex-1">
              {loading ? "Confirming..." : "Confirm"}
            </SufiButton>
          </div>
        </form>
      )}
    </SufiModal>
  );
}
