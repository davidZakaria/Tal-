"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Mail,
  Phone,
  Trash2,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  Archive,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api";
import { adminFetch, AdminSessionInvalidError } from "@/lib/adminAuth";

type LeadStatus = "new" | "contacted" | "qualified" | "archived";

type Lead = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  locale?: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<
  LeadStatus,
  { label: string; className: string; Icon: typeof Sparkles }
> = {
  new: {
    label: "New",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    Icon: Sparkles,
  },
  contacted: {
    label: "Contacted",
    className: "bg-sky-50 text-sky-700 border-sky-100",
    Icon: Clock,
  },
  qualified: {
    label: "Qualified",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Icon: CheckCircle2,
  },
  archived: {
    label: "Archived",
    className: "bg-sapphire/5 text-sapphire/60 border-sapphire/10",
    Icon: Archive,
  },
};

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "archived"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await adminFetch(apiUrl("/api/leads"));
      if (!res.ok) {
        console.error(`Failed to load leads (${res.status})`);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as Lead[];
      setLeads(data);
    } catch (err) {
      if (err instanceof AdminSessionInvalidError) return;
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        (lead.notes || "").toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  const stats = useMemo(() => {
    const total = leads.length;
    const counts: Record<LeadStatus, number> = { new: 0, contacted: 0, qualified: 0, archived: 0 };
    for (const l of leads) counts[l.status] = (counts[l.status] ?? 0) + 1;
    const last7 = leads.filter((l) => Date.now() - new Date(l.createdAt).getTime() < 7 * 86400e3).length;
    return { total, counts, last7 };
  }, [leads]);

  const updateStatus = async (lead: Lead, next: LeadStatus) => {
    if (lead.status === next) return;
    setBusyId(lead._id);
    const previous = leads;
    setLeads((ls) => ls.map((l) => (l._id === lead._id ? { ...l, status: next } : l)));
    try {
      const res = await adminFetch(apiUrl(`/api/leads/${lead._id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("update failed");
    } catch (err) {
      if (err instanceof AdminSessionInvalidError) return;
      console.error(err);
      setLeads(previous);
      alert("Could not update the lead. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (lead: Lead) => {
    if (!confirm(`Delete lead from ${lead.name} (${lead.email})? This cannot be undone.`)) return;
    setBusyId(lead._id);
    try {
      const res = await adminFetch(apiUrl(`/api/leads/${lead._id}`), { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setLeads((ls) => ls.filter((l) => l._id !== lead._id));
    } catch (err) {
      if (err instanceof AdminSessionInvalidError) return;
      console.error(err);
      alert("Could not delete the lead. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const rows = filtered.length ? filtered : leads;
    const header = ["Received", "Name", "Email", "Phone", "Status", "Locale", "Notes", "AssignedTo"];
    const body = rows.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.name,
      l.email,
      l.phone,
      l.status,
      l.locale || "",
      l.notes || "",
      l.assignedTo || "",
    ]);
    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tale-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-10"
    >
      <div className="flex flex-wrap gap-6 justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-sapphire font-light tracking-tight mb-2">Presentation Leads</h1>
          <p className="text-sm font-medium tracking-[0.2em] text-sapphire/50 uppercase">
            Private presentation requests captured from the marketing site
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-sapphire/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, notes…"
              className="pl-12 pr-6 py-3 bg-white border border-sapphire/10 rounded-full text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise shadow-sm w-72 text-sapphire placeholder-sapphire/30 font-medium"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!leads.length}
            className="flex items-center gap-2 bg-sapphire text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-turquoise transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Last 7 days" value={stats.last7} />
        <StatCard label="New" value={stats.counts.new} accent="amber" />
        <StatCard label="Contacted" value={stats.counts.contacted} accent="sky" />
        <StatCard label="Qualified" value={stats.counts.qualified} accent="emerald" />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
          All ({leads.length})
        </FilterChip>
        {STATUS_OPTIONS.map((s) => (
          <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {STATUS_STYLES[s].label} ({stats.counts[s] ?? 0})
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sapphire/60">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-sapphire/5 border border-sapphire/5 p-16 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-sapphire/30 mb-4" />
          <h3 className="text-2xl font-serif text-sapphire font-light mb-2">
            {leads.length === 0 ? "No leads yet." : "No matches."}
          </h3>
          <p className="text-sapphire/60 text-sm">
            {leads.length === 0
              ? "Presentation requests submitted from the marketing site will appear here."
              : "Try clearing the search or switching the status filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-sapphire/5 border border-sapphire/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-light/60 text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold">
                <tr>
                  <th className="text-start px-6 py-4">Received</th>
                  <th className="text-start px-6 py-4">Guest</th>
                  <th className="text-start px-6 py-4">Contact</th>
                  <th className="text-start px-6 py-4">Status</th>
                  <th className="text-end px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const status = STATUS_STYLES[lead.status] ?? STATUS_STYLES.new;
                  const StatusIcon = status.Icon;
                  return (
                    <tr key={lead._id} className="border-t border-sapphire/5 hover:bg-sand-light/30 transition-colors">
                      <td className="px-6 py-4 align-top whitespace-nowrap text-sapphire/70">
                        <div className="font-semibold text-sapphire">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-xs text-sapphire/50 mt-1">
                          {new Date(lead.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </div>
                        {lead.locale && (
                          <div className="text-[10px] uppercase tracking-widest text-sapphire/40 mt-1">{lead.locale}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top min-w-[180px]">
                        <div className="flex items-center gap-2 text-sapphire font-semibold">
                          <UserRound className="w-4 h-4 text-sapphire/40" />
                          {lead.name}
                        </div>
                        {lead.notes && (
                          <p className="text-xs text-sapphire/60 mt-2 max-w-xs whitespace-pre-wrap">{lead.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-2 text-sapphire hover:text-turquoise transition-colors"
                        >
                          <Mail className="w-4 h-4 text-sapphire/40" /> {lead.email}
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-2 text-sapphire/80 hover:text-turquoise transition-colors mt-2"
                        >
                          <Phone className="w-4 h-4 text-sapphire/40" /> {lead.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex w-max items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${status.className}`}
                          >
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </span>
                          <select
                            value={lead.status}
                            disabled={busyId === lead._id}
                            onChange={(e) => updateStatus(lead, e.target.value as LeadStatus)}
                            className="text-xs bg-sand-light/60 border border-sapphire/10 rounded-full px-3 py-1.5 focus:outline-none focus:border-turquoise"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_STYLES[s].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-end">
                        <button
                          type="button"
                          onClick={() => remove(lead)}
                          disabled={busyId === lead._id}
                          aria-label={`Delete lead from ${lead.name}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sapphire/50 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {busyId === lead._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  accent = "sapphire",
}: {
  label: string;
  value: number;
  accent?: "sapphire" | "amber" | "sky" | "emerald";
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-600"
      : accent === "sky"
      ? "text-sky-600"
      : accent === "emerald"
      ? "text-emerald-600"
      : "text-sapphire";
  return (
    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-sapphire/5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-sapphire/50 font-bold mb-2">{label}</p>
      <p className={`text-3xl font-light ${accentClass}`}>{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-colors ${
        active
          ? "bg-sapphire text-white border-sapphire"
          : "bg-white text-sapphire/70 border-sapphire/10 hover:border-sapphire/30"
      }`}
    >
      {children}
    </button>
  );
}
