"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, CreditCard, Clock, Calendar, MessageSquare, CheckCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";

interface Reservation {
  _id: string;
  bookingCode?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyId: { name: string } | null;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  paymentStatus?: string;
  paymentGatewayReference: string;
  createdAt: string;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const token = localStorage.getItem("adminToken");
    fetch(apiUrl("/api/inventory/reservations"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("JWT Reject");
        return res.json();
      })
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  });

  const handleApprove = async (id: string) => {
    try {
      const resp = await fetch(apiUrl(`/api/inventory/reservations/${id}/approve`), {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (resp.ok) load();
      else {
        const d = await resp.json();
        alert(d.message || "Approve failed");
      }
    } catch {
      alert("Approve failed");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this reservation request?")) return;
    try {
      const resp = await fetch(apiUrl(`/api/inventory/reservations/${id}/reject`), {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (resp.ok) load();
      else {
        const d = await resp.json();
        alert(d.message || "Reject failed");
      }
    } catch {
      alert("Reject failed");
    }
  };

  const handleManualConfirm = async (id: string) => {
    if (
      !confirm(
        "Mark this reservation as paid without PayMob? Use for wire transfers or development only."
      )
    )
      return;
    try {
      const resp = await fetch(apiUrl(`/api/inventory/reservations/${id}/confirm`), {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (resp.ok) load();
      else {
        const d = await resp.json();
        alert(d.message || "Confirm failed");
      }
    } catch {
      alert("Confirm failed");
    }
  };

  const approvalLabel = (r: Reservation) => {
    if (r.status === "PendingApproval") return "Awaiting approval";
    if (r.status === "ApprovedAwaitingPayment") return "Approved";
    if (r.status === "Confirmed") return "Confirmed";
    if (r.status === "Rejected") return "Rejected";
    if (r.status === "Cancelled") return "Cancelled";
    return r.status;
  };

  const paymentLabel = (r: Reservation) => {
    if (r.paymentStatus === "paid" || r.status === "Confirmed") return "Paid";
    if (r.paymentStatus === "pending_gateway") return "Checkout started";
    return "Unpaid";
  };

  const getPaymentBadge = (r: Reservation) => {
    const paid = r.paymentStatus === "paid" || r.status === "Confirmed";
    if (paid) {
      return (
        <span className="flex items-center w-max gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
          <CheckCircle className="w-3 h-3" /> Paid
        </span>
      );
    }
    if (r.paymentStatus === "pending_gateway") {
      return (
        <span className="flex items-center w-max gap-2 bg-sky-50 text-sky-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-sky-100">
          <Clock className="w-3 h-3" /> Gateway pending
        </span>
      );
    }
    return (
      <span className="flex items-center w-max gap-2 bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
        <CreditCard className="w-3 h-3" /> Unpaid
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-10"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-sapphire font-light tracking-tight mb-2">Guest Ledger</h1>
          <p className="text-sm font-medium tracking-[0.2em] text-sapphire/50 uppercase">
            Reservations, approvals, and payment status
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-sapphire/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guests or booking ID..."
              className="pl-12 pr-6 py-3 bg-white border border-sapphire/10 rounded-full text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise shadow-sm w-64 text-sapphire placeholder-sapphire/30 transition-all font-medium"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 bg-white border border-sapphire/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-sapphire hover:border-turquoise hover:text-turquoise transition-all shadow-sm group"
          >
            <Filter className="w-4 h-4 text-sapphire/40 group-hover:text-turquoise" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-sapphire/5 border border-sapphire/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-light/50 border-b border-sapphire/10">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">
                  Booking ID
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">
                  Guest Details
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">
                  Suite & Timeline
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">
                  Ledger (EGP)
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">
                  Approval
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50">
                  Payment
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire/50 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sapphire/5">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="animate-pulse border-b border-sapphire/5">
                      <td className="px-8 py-6">
                        <div className="h-4 w-24 bg-sand/50 rounded mb-2" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-4 w-32 bg-sand/50 rounded mb-2" />
                        <div className="h-3 w-48 bg-sand/40 rounded" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-4 w-40 bg-sand/50 rounded mb-2" />
                        <div className="h-3 w-36 bg-sand/40 rounded" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-4 w-24 bg-sand/50 rounded" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-8 w-20 bg-sand/40 rounded-full" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-8 w-20 bg-sand/40 rounded-full" />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="h-8 w-24 bg-sand/40 rounded-full ml-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="w-16 h-16 bg-sand-light rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-6 h-6 text-sapphire/30" />
                    </div>
                    <p className="text-lg text-sapphire/50 font-light mb-2">The ledger is completely pristine.</p>
                    <p className="text-xs uppercase tracking-widest text-sapphire/30 font-bold">
                      No active transactions tracked yet.
                    </p>
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
                    <td className="px-8 py-6 font-mono text-sm text-sapphire">
                      {res.bookingCode || res._id.slice(-8)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sapphire/5 flex items-center justify-center text-sapphire font-serif text-xl border border-sapphire/10">
                          {res.guestName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sapphire mb-1">{res.guestName}</p>
                          <p className="text-xs text-sapphire/50 mb-0.5 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> {res.guestEmail}
                          </p>
                          <p className="text-xs text-sapphire/40">{res.guestPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sapphire tracking-wide mb-1 text-sm">
                        {res.propertyId?.name || "Unknown Suite"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-sapphire/60">
                        <Calendar className="w-3 h-3 text-terracotta" />
                        <span>
                          {new Date(res.checkInDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="text-sapphire/30">→</span>
                        <span>
                          {new Date(res.checkOutDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sapphire flex items-center gap-2">
                        {paymentLabel(res) === "Paid" ? (
                          <CreditCard className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-sapphire/20" />
                        )}
                        {res.totalPrice.toLocaleString()} EGP
                      </p>
                      <p
                        className="text-[10px] uppercase font-bold tracking-widest text-sapphire/30 mt-2 truncate w-32"
                        title={res.paymentGatewayReference}
                      >
                        Gateway: {res.paymentGatewayReference || "—"}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-semibold text-sapphire/80">{approvalLabel(res)}</span>
                    </td>
                    <td className="px-8 py-6">{getPaymentBadge(res)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col gap-2 items-end">
                        {res.status === "PendingApproval" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(res._id)}
                              className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(res._id)}
                              className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {res.status === "ApprovedAwaitingPayment" && (
                          <button
                            type="button"
                            onClick={() => handleManualConfirm(res._id)}
                            className="px-4 py-2 bg-sapphire/10 border border-sapphire/20 text-sapphire rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-sapphire hover:text-white transition-all shadow-sm"
                          >
                            Mark paid (manual)
                          </button>
                        )}
                        {res.status !== "PendingApproval" && res.status !== "ApprovedAwaitingPayment" && (
                          <button
                            type="button"
                            className="p-3 bg-white border border-sapphire/10 rounded-xl text-sapphire/50 hover:bg-sapphire hover:text-white hover:border-sapphire transition-all shadow-sm"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
