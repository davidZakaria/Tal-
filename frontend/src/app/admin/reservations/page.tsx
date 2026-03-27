"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, CreditCard, Clock, XCircle, Calendar, MessageSquare } from "lucide-react";

interface Reservation {
  _id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyId: { name: string } | null;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  paymentGatewayReference: string;
  createdAt: string;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/inventory/reservations`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("JWT Reject");
        return res.json();
      })
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleOverride = async (id: string) => {
    if (!confirm("Are you completely certain you want to forcefully bypass PayMob and manually Mark as Paid for this property?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/inventory/reservations/${id}/confirm`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        setReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'Confirmed' } : r));
      } else {
        alert("Failed to confirm through MongoDB.");
      }
    } catch (error) {
      console.error("Localhost DB override crash:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Confirmed') {
      return (
        <span className="flex items-center w-max gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100 shadow-[0_2px_10px_rgba(16,185,129,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Paid
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="flex items-center w-max gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="flex items-center w-max gap-2 bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
        <XCircle className="w-3 h-3" /> Cancelled
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-10">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-sapphire font-light tracking-tight mb-2">Guest Ledger</h1>
          <p className="text-sm font-medium tracking-[0.2em] text-sapphire/50 uppercase">Monitor Transactions & Occupancy</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-sapphire/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search guests or PNR..." 
              className="pl-12 pr-6 py-3 bg-white border border-sapphire/10 rounded-full text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise shadow-sm w-64 text-sapphire placeholder-sapphire/30 transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-sapphire/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-sapphire hover:border-turquoise hover:text-turquoise transition-all shadow-sm group">
            <Filter className="w-4 h-4 text-sapphire/40 group-hover:text-turquoise" /> Filter
          </button>
        </div>
      </div>

      {/* Modern High-End Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-sapphire/5 border border-sapphire/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-light/50 border-b border-sapphire/10">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">Guest Details</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">Suite & Timeline</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">Ledger (EGP)</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sapphire/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 relative mb-4">
                         <div className="absolute inset-0 rounded-full border-t-2 border-sapphire animate-spin"></div>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-sapphire/40">Syncing Master Database</span>
                    </div>
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-16 h-16 bg-sand-light rounded-full flex items-center justify-center mx-auto mb-6">
                       <Calendar className="w-6 h-6 text-sapphire/30" />
                    </div>
                    <p className="text-lg text-sapphire/50 font-light mb-2">The ledger is completely pristine.</p>
                    <p className="text-xs uppercase tracking-widest text-sapphire/30 font-bold">No active transactions tracked yet.</p>
                  </td>
                </tr>
              ) : (
                reservations.map((res, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={res._id} 
                    className="group hover:bg-sand-light/20 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sapphire/5 flex items-center justify-center text-sapphire font-serif text-xl border border-sapphire/10">
                          {res.guestName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sapphire mb-1">{res.guestName}</p>
                          <p className="text-xs text-sapphire/50 mb-0.5 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> {res.guestEmail}</p>
                          <p className="text-xs text-sapphire/40">{res.guestPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sapphire tracking-wide mb-1 text-sm">{res.propertyId?.name || "Unknown Suite"}</p>
                      <div className="flex items-center gap-2 text-xs text-sapphire/60">
                        <Calendar className="w-3 h-3 text-terracotta" />
                        <span>{new Date(res.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <span className="text-sapphire/30">→</span>
                        <span>{new Date(res.checkOutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sapphire flex items-center gap-2">
                        {res.status === 'Confirmed' ? <CreditCard className="w-4 h-4 text-emerald-500" /> : <CreditCard className="w-4 h-4 text-sapphire/20" />}
                        {res.totalPrice.toLocaleString()} EGP
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-sapphire/30 mt-2 truncate w-32" title={res.paymentGatewayReference}>
                        PNR: {res.paymentGatewayReference || 'UNALLOCATED'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {res.status === 'Pending' ? (
                        <button 
                          onClick={() => handleOverride(res._id)}
                          className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        >
                          Manual Verification
                        </button>
                      ) : (
                        <button className="p-3 bg-white border border-sapphire/10 rounded-xl text-sapphire/50 hover:bg-sapphire hover:text-white hover:border-sapphire transition-all shadow-sm">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
