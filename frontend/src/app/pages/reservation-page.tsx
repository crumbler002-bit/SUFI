import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Calendar, Clock, Users, CreditCard, Mail, Phone, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function ReservationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const restaurant = {
    name: "Le Bernardin",
    image: "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    cuisine: "French Fine Dining",
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      navigate('/profile');
    }, 3000);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-12 h-12 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-4">Reservation Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your table has been reserved. A confirmation email has been sent to your inbox.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold mb-3">{restaurant.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Date: March 15, 2026</p>
                <p>Time: 7:00 PM</p>
                <p>Party Size: 4 guests</p>
                <p>Confirmation: #SUFI-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
            <Button onClick={() => navigate('/profile')} className="w-full">
              View My Reservations
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={() => navigate('/')} className="text-2xl font-bold">
            SUFI
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 transition-colors ${
                      step > s ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-32 mt-4">
            <span className={step >= 1 ? "font-semibold" : "text-gray-500"}>
              Details
            </span>
            <span className={step >= 2 ? "font-semibold" : "text-gray-500"}>
              Information
            </span>
            <span className={step >= 3 ? "font-semibold" : "text-gray-500"}>
              Confirm
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left - Restaurant Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 sticky top-6">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-4">{restaurant.cuisine}</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>March 15, 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>7:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>4 guests</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right - Form Steps */}
          <div className="md:col-span-2">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Reservation Details</h2>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        defaultValue="2026-03-15"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <select
                        id="time"
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>5:00 PM</option>
                        <option>5:30 PM</option>
                        <option>6:00 PM</option>
                        <option>6:30 PM</option>
                        <option selected>7:00 PM</option>
                        <option>7:30 PM</option>
                        <option>8:00 PM</option>
                        <option>8:30 PM</option>
                        <option>9:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="guests">Number of Guests</Label>
                      <select
                        id="guests"
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>1 guest</option>
                        <option>2 guests</option>
                        <option>3 guests</option>
                        <option selected>4 guests</option>
                        <option>5 guests</option>
                        <option>6 guests</option>
                        <option>7+ guests</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="occasion">Special Occasion (Optional)</Label>
                      <select
                        id="occasion"
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an occasion</option>
                        <option>Birthday</option>
                        <option>Anniversary</option>
                        <option>Business Dinner</option>
                        <option>Date Night</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="requests">Special Requests (Optional)</Label>
                      <textarea
                        id="requests"
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Any dietary restrictions, seating preferences, etc."
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Your Information</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="lastName"
                            placeholder="Smith"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Confirmation will be sent to this email
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        For reservation updates and reminders
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <input type="checkbox" className="mt-1" id="marketing" />
                      <Label htmlFor="marketing" className="text-sm cursor-pointer">
                        I'd like to receive updates about special offers and promotions from SUFI
                      </Label>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setStep(3)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Confirm Your Reservation</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold mb-4">Reservation Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Restaurant</span>
                          <span className="font-medium">{restaurant.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date</span>
                          <span className="font-medium">March 15, 2026</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time</span>
                          <span className="font-medium">7:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Party Size</span>
                          <span className="font-medium">4 guests</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name</span>
                          <span className="font-medium">John Smith</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email</span>
                          <span className="font-medium">john@example.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone</span>
                          <span className="font-medium">(555) 123-4567</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="font-bold mb-3">Cancellation Policy</h3>
                      <p className="text-sm text-gray-700">
                        You can cancel or modify your reservation up to 24 hours before your scheduled time. 
                        No-shows or late cancellations may be subject to a fee.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="mt-1" 
                        id="terms"
                        defaultChecked
                      />
                      <Label htmlFor="terms" className="text-sm cursor-pointer">
                        I agree to the cancellation policy and terms of service
                      </Label>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(2)}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={handleConfirm}
                      >
                        Confirm Reservation
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
