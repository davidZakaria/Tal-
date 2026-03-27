"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProperty } from "@/hooks/useProperties";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Wifi, Wind, Coffee, Bed, Bath, Waves, Loader2, Calendar, AlertCircle, type LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api";

export default function PropertyDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: property, isLoading, error } = useProperty(id);

  // Booking State
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);

  useEffect(() => {
    setGuestToken(typeof window !== "undefined" ? localStorage.getItem("guestToken") : null);
  }, []);

  // Anti-Collision Calendar Logic
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  useEffect(() => {
    if(!id) return;
    fetch(apiUrl(`/api/inventory/booked-dates/${id}`))
      .then(res => res.json())
      .then(data => setBookedDates(data || []))
      .catch(console.error);
  }, [id]);

  const checkConflict = () => {
    if (!arrivalDate || !departureDate) return false;
    const curr = new Date(arrivalDate);
    const last = new Date(departureDate);

    if (curr > last) return true; // Safety logic reverse-date block

    // Day Use Logic
    if (curr.getTime() === last.getTime()) {
       return bookedDates.includes(curr.toISOString().split('T')[0]);
    }
    
    // Multi Night Logic (Don't trigger conflict just because we selected a Checkout Date as our Arrival Date!)
    while(curr < last) {
      if(bookedDates.includes(curr.toISOString().split('T')[0])) return true;
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  };
  const hasConflict = checkConflict();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light">
        <Loader2 className="w-12 h-12 text-sapphire animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center flex-col gap-6 justify-center bg-sand-light text-sapphire">
        <p className="uppercase tracking-[0.2em] font-bold text-sm">Property not found.</p>
        <button onClick={() => router.back()} className="text-xs uppercase hover:text-terracotta border-b border-sapphire">Return to Home</button>
      </div>
    );
  }

  // Calculate generic total price for visual wow
  let nights = 1;
  if (arrivalDate && departureDate) {
    const d1 = new Date(arrivalDate);
    const d2 = new Date(departureDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) nights = diff;
  }

  const totalPrice = property.basePrice * nights;

  const checkoutHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (guestToken) {
    checkoutHeaders.Authorization = `Bearer ${guestToken}`;
  }

  return (
    <div className="min-h-screen bg-sand-light pb-32">
      {/* Immersive Panoramic Header */}
      <div className="relative w-full h-[60vh] min-h-[500px]">
        {property.images && property.images.length > 0 ? (
          <Image 
            src={property.images[0]} 
            alt={property.name} 
            fill 
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-sapphire/10 flex items-center justify-center">
            <span className="text-sapphire/30 text-2xl uppercase tracking-widest">No Media Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-sapphire/90 via-sapphire/20 to-transparent" />
        
        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 w-full p-8 md:p-12 z-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 text-white/80 hover:text-white transition-all uppercase tracking-[0.2em] font-bold text-xs bg-black/20 backdrop-blur-md px-6 py-3 rounded-full hover:bg-black/40"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Listings
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="uppercase tracking-[0.3em] font-bold text-xs text-sand mb-4 block">Signature Collection</span>
            <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight max-w-4xl">{property.name}</h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 lg:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-7 space-y-16">
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-sapphire/40 mb-6">The Experience</h2>
            <p className="text-sapphire text-xl lg:text-2xl font-light leading-relaxed">
              {property.description || "Indulge in an uninterrupted coastal escape tailored perfectly to your every desire. Featuring unparalleled panoramic views and lavish interior comforts designed to evoke the soul of a beach resort."}
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-sapphire/40 mb-8">Amenities & Features</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sapphire">
                {property.amenities.map((amenity: string, idx: number) => {
                   const AMENITY_ICONS: Record<string, LucideIcon> = {
                     "High-Speed Fiber": Wifi,
                     "Red Sea View": Waves,
                     "Climate Control": Wind,
                     "Mini Bar": Coffee,
                     "Master Suite": Bed,
                     "En-Suite Bath": Bath,
                     "Private Pool": Waves,
                     "Balcony Lounge": Wind,
                     "Private Cinema": Coffee
                   };
                   const Icon = AMENITY_ICONS[amenity] || Coffee;
                   return (
                     <div key={idx} className="flex flex-col gap-3 group">
                       <Icon className="w-6 h-6 text-terracotta group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-medium">{amenity}</span>
                     </div>
                   );
                })}
              </div>
            ) : (
               <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-sapphire/40">Configuration Pending. Standard luxury amenities included globally.</p>
            )}
          </motion.section>

          {/* Reserved Dates Ledger UI */}
          {bookedDates.length > 0 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-16 pt-16 border-t border-sapphire/10">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-sapphire/40 mb-8 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-terracotta" /> Live Occupancy Ledger
              </h2>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(bookedDates)).sort().map((dateStr, idx) => {
                  const dateObj = new Date(dateStr);
                  // Safely bypass UTC zero-hour rendering offset so it perfectly matches String Date
                  dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
                  
                  return (
                    <motion.span whileHover={{ scale: 1.05 }} key={idx} className="bg-white border border-sapphire/10 text-sapphire/80 px-5 py-3 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-3 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta/80 relative flex-shrink-0">
                         <span className="absolute inset-0 rounded-full bg-terracotta animate-ping opacity-70"></span>
                      </span>
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </motion.span>
                  )
                })}
              </div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-sapphire/50 mt-8 max-w-lg leading-relaxed border-l-2 border-sapphire/20 pl-4 py-1">
                These extremely highly requested dates are currently secured by private reservations. Please configure your itinerary accordingly.
              </p>
            </motion.section>
          )}
        </div>

        {/* Right Column: Sticky Booking Modal */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="sticky top-12 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-sapphire/5 border border-sapphire/10"
          >
            <div className="pb-8 border-b border-sapphire/10 mb-8">
              <p className="text-3xl font-serif text-sapphire font-light">
                {property.basePrice} <span className="text-lg uppercase tracking-widest font-bold text-sapphire/40">EGP</span>
              </p>
              <p className="text-xs uppercase tracking-widest font-bold text-sapphire/60 mt-2">per night</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Arrival */}
                <div className="bg-sand-light/50 p-4 rounded-2xl border border-sapphire/5 transition-all focus-within:border-turquoise focus-within:bg-white relative">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-sapphire/50 absolute top-3 left-4">Arrival</label>
                  <input 
                    type="date" 
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full mt-4 bg-transparent text-sapphire font-medium text-sm focus:outline-none placeholder-sapphire/30 cursor-pointer"
                  />
                </div>
                {/* Departure */}
                <div className="bg-sand-light/50 p-4 rounded-2xl border border-sapphire/5 transition-all focus-within:border-turquoise focus-within:bg-white relative">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-sapphire/50 absolute top-3 left-4">Departure</label>
                  <input 
                    type="date" 
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full mt-4 bg-transparent text-sapphire font-medium text-sm focus:outline-none placeholder-sapphire/30 cursor-pointer"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="bg-sand-light/50 p-4 rounded-2xl border border-sapphire/5 transition-all focus-within:border-turquoise focus-within:bg-white relative">
                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-sapphire/50 absolute top-3 left-4">Guests</label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full mt-4 bg-transparent text-sapphire font-medium text-sm focus:outline-none cursor-pointer appearance-none"
                >
                  {[...Array(property.capacity || 2)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? "Guest" : "Guests"}</option>
                  ))}
                </select>
              </div>

              {guestToken ? (
                <p className="text-xs leading-relaxed text-sapphire/80 bg-turquoise/10 border border-turquoise/25 rounded-2xl px-4 py-3">
                  You are signed in. This reservation will show in your{" "}
                  <strong className="text-sapphire">Guest portal</strong> under Travel Portfolio (use the same email as your account).
                </p>
              ) : (
                <p className="text-xs text-sapphire/55">
                  <Link
                    href="/portal"
                    className="font-semibold text-terracotta underline-offset-2 hover:underline"
                  >
                    Sign in to the guest portal
                  </Link>{" "}
                  first so we can attach this booking to your account.
                </p>
              )}

              {/* Conflict Alert Panel */}
              {hasConflict && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-start gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">Those dates are already occupied by another luxurious getaway. Please select a pristine alternative range.</p>
                </motion.div>
              )}

                {/* Total Calculation */}
              {arrivalDate && departureDate && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="py-4 space-y-3 overflow-hidden">
                  <div className="flex justify-between text-sapphire/70 text-sm">
                    <span>{property.basePrice} EGP x {nights} nights</span>
                    <span>{totalPrice} EGP</span>
                  </div>
                  <div className="flex justify-between text-sapphire/70 text-sm">
                    <span>Taxes & Fees (14%)</span>
                    <span>{Math.round(totalPrice * 0.14)} EGP</span>
                  </div>
                  <div className="flex justify-between text-sapphire font-bold text-lg pt-4 border-t border-sapphire/10">
                    <span>Total</span>
                    <span>{Math.round(totalPrice * 1.14)} EGP</span>
                  </div>
                </motion.div>
              )}

              <button 
                disabled={isProcessing || !arrivalDate || !departureDate || hasConflict}
                onClick={async () => {
                  setIsProcessing(true);
                  setPaymentError(null);
                  try {
                    const payReq = await fetch(apiUrl("/api/payment/checkout"), {
                      method: "POST",
                      headers: checkoutHeaders,
                      body: JSON.stringify({
                        propertyId: id,
                        amountEGP: Math.round(totalPrice * 1.14),
                        guests,
                        arrival: arrivalDate,
                        departure: departureDate
                      })
                    });
                    const data = await payReq.json();
                    if (!payReq.ok) {
                      setPaymentError(
                        data.message || data.error || "Checkout could not be started."
                      );
                      setIsProcessing(false);
                      return;
                    }
                    if (data.iframe_url) {
                      window.location.href = data.iframe_url;
                    } else {
                      setPaymentError(
                        data.message ||
                          "Configure PayMob credentials in the backend .env to generate live checkouts."
                      );
                      setIsProcessing(false);
                    }
                  } catch {
                    setPaymentError("Checkout could not be started. Check your connection and try again.");
                    setIsProcessing(false);
                  }
                }}
                className={`w-full mt-4 py-5 rounded-full uppercase tracking-[0.2em] font-bold text-xs shadow-xl transition-all group flex items-center justify-center gap-3
                  ${hasConflict ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20' : 
                   'bg-sapphire text-white shadow-sapphire/20 hover:bg-turquoise disabled:opacity-50 disabled:cursor-not-allowed'}`}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (!hasConflict && <Calendar className="w-4 h-4 group-hover:animate-pulse" />)} 
                {hasConflict ? "DATES OCCUPIED" : isProcessing ? "INITIALIZING PAYMOB..." : "RESERVE SUITE"}
              </button>
              {paymentError && (
                <p className="mt-3 text-sm text-red-600 text-center" role="alert">
                  {paymentError}
                </p>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
