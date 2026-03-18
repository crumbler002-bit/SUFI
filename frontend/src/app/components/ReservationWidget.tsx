import { motion } from "motion/react";
import { useState } from "react";
import { Calendar, Users, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { fadeIn, staggerContainer, staggerItem } from "../lib/motion";
import { timeSlots } from "../lib/utils";
import { autoCreateReservation } from "../services/reservation";

interface ReservationWidgetProps {
  restaurantId?: number;
  restaurantName: string;
}

export function ReservationWidget({ restaurantId, restaurantName }: ReservationWidgetProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState<"idle" | "loading" | "confirmed" | "waitlisted" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleReserve = async () => {
    if (!selectedDate || !selectedTime || !restaurantId) return;
    setStatus("loading");
    try {
      const datetime = `${selectedDate}T${to24h(selectedTime)}:00`;
      const result: any = await autoCreateReservation(restaurantId, datetime, guests);
      if (result.status === "waitlisted") {
        setStatus("waitlisted");
        setMessage(`Added to waitlist (position #${result.waitlist_id})`);
      } else {
        setStatus("confirmed");
        setMessage(`Table #${result.table_id} confirmed!`);
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Something went wrong");
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-card rounded-2xl shadow-xl p-6 border border-border"
    >
      <h3 className="text-2xl font-bold mb-6">Make a Reservation</h3>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Calendar className="w-4 h-4 text-[#F97316]" />
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-all"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Users className="w-4 h-4 text-[#F97316]" />
          Number of Guests
        </label>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setGuests(Math.max(1, guests - 1))}>-</Button>
          <span className="text-xl font-semibold w-12 text-center">{guests}</span>
          <Button variant="outline" size="sm" onClick={() => setGuests(Math.min(20, guests + 1))}>+</Button>
        </div>
      </div>

      {selectedDate && (
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mb-6">
          <label className="text-sm font-medium mb-3 block">Select Time</label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <motion.button
                key={time}
                variants={staggerItem}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTime(time)}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                  selectedTime === time
                    ? "border-[#F97316] bg-[#F97316] text-white"
                    : "border-border hover:border-[#F97316]"
                }`}
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <Button
        onClick={handleReserve}
        disabled={!selectedDate || !selectedTime || status === "loading" || status === "confirmed"}
        className="w-full"
        size="lg"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Reserving...</>
        ) : status === "confirmed" ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
            <Check className="w-5 h-5" />Confirmed!
          </motion.div>
        ) : "Reserve Table"}
      </Button>

      {(status === "confirmed" || status === "waitlisted" || status === "error") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl border text-sm font-medium ${
            status === "confirmed" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : status === "waitlisted" ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {status === "confirmed" && `Your table at ${restaurantName} is reserved for ${selectedDate} at ${selectedTime}. ${message}`}
          {status === "waitlisted" && `No tables available right now. ${message} — we'll notify you when a table opens.`}
          {status === "error" && message}
        </motion.div>
      )}
    </motion.div>
  );
}

function to24h(time12: string): string {
  const [time, modifier] = time12.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours) + 12);
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.padStart(2, "0")}:${minutes}`;
}
