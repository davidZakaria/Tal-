"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, CalendarCheck, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api";

type LedgerReservation = {
  _id: string;
  status: string;
  totalPrice: number;
  guestName?: string;
  propertyId?: { name?: string };
};

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<LedgerReservation[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch(apiUrl("/api/inventory/reservations"), {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Security Blocked");
        return res.json();
      })
      .then(data => setReservations(data))
      .catch(console.error);
  }, []);

  const totalRevenue = reservations.filter(r => r.status === 'Confirmed').reduce((sum, r) => sum + r.totalPrice, 0);
  const pendingPayments = reservations.filter(r => r.status === 'Pending').length;
  const activeBookings = reservations.filter(r => r.status === 'Confirmed').length;

  const stats = [
    { title: "Verified Revenue", value: `${totalRevenue.toLocaleString()} EGP`, trend: "LIVE ENGINE", icon: TrendingUp },
    { title: "Confirmed Bookings", value: `${activeBookings}`, trend: "LIVE ENGINE", icon: Users },
    { title: "Global Volume", value: "98%", trend: "HIGH DEMAND", icon: CalendarCheck },
    { title: "Pending Ledgers", value: `${pendingPayments}`, trend: "ACTION REQ", icon: CreditCard },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-10">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-serif text-sapphire mb-4 font-light tracking-tight">Resort Overview</h2>
          <p className="text-sapphire/70 font-light text-lg">Your tactile snapshot of Talé Hotel operations today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-sapphire/5 border border-sapphire/5 hover:border-turquoise/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-sand/20 rounded-2xl text-sapphire">
                  <Icon className="w-7 h-7" />
                </div>
                <span className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-turquoise/20 text-emerald-700' : 'bg-terracotta/20 text-red-700'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-4xl font-light text-sapphire tracking-tighter mb-2">{stat.value}</h3>
              <p className="text-[10px] text-sapphire/50 uppercase tracking-[0.2em] font-semibold">{stat.title}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-sapphire/5 p-10 border border-sapphire/5 min-h-[400px] flex flex-col">
          <h3 className="text-2xl font-serif text-sapphire font-light mb-8">Revenue Analytics</h3>
          <div className="flex-1 bg-sand-light/50 rounded-3xl border border-sapphire/5 flex flex-col items-center justify-center text-sapphire/30 group hover:border-turquoise/30 transition-all cursor-pointer">
             <TrendingUp className="w-12 h-12 mb-4 opacity-50 group-hover:text-turquoise transition-colors" />
            <p className="font-semibold uppercase tracking-widest text-xs">Recharts Integration Pending</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-sapphire/5 p-10 border border-sapphire/5">
          <h3 className="text-2xl font-serif text-sapphire font-light mb-8">Recent Bookings</h3>
          <div className="space-y-4">
            {reservations.slice(0, 5).map((res) => (
              <div key={res._id} className="flex justify-between items-center p-5 hover:bg-sand-light/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-sapphire/5 group">
                <div>
                  <p className="font-semibold text-sapphire text-sm mb-1 group-hover:text-turquoise transition-colors">{res.guestName ?? "Guest"}</p>
                  <p className="text-[10px] uppercase tracking-widest text-sapphire/50 font-medium truncate w-40">{res.propertyId?.name || "Unknown Suite"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sapphire mb-1">{res.totalPrice.toLocaleString()} EGP</p>
                  <p className={`text-[9px] uppercase tracking-widest font-bold ${res.status === 'Confirmed' ? 'text-emerald-600' : 'text-amber-500'}`}>{res.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
