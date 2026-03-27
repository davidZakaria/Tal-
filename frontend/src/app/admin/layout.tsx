"use client";

import Link from "next/link";
import { LayoutDashboard, Home, CalendarDays, ReceiptText, LogOut, LockKeyhole, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const [email, setEmail] = useState("admin@tale.com");
  const [password, setPassword] = useState("password123");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
    setIsChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (resp.ok && data.role === 'Admin') {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || "Unauthorized access explicitly denied.");
      }
    } catch (err) {
      setLoginError("MongoDB Authentication Server unreachable.");
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const menu = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin" },
    { name: "Config & Inventory", icon: Home, path: "/admin/properties" },
    { name: "Global Ledger", icon: ReceiptText, path: "/admin/reservations" },
  ];

  if (isChecking) return <div className="min-h-screen bg-sand-light flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sapphire" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sapphire flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d40d886d?q=80&w=2000')] bg-cover opacity-10 mix-blend-overlay" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-md relative z-10 text-center">
          <LockKeyhole className="w-12 h-12 text-sand-light mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl font-serif text-white tracking-widest mb-2">Talé Access</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-turquoise mb-10">Restricted Admin Payload</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="email" placeholder="Admin Encrypted Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-sapphire/50 text-white border border-white/10 rounded-full px-6 py-4 text-xs font-bold tracking-widest placeholder-white/30 focus:outline-none focus:border-turquoise text-center"
            />
            <input 
              type="password" placeholder="Terminal Passkey" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-sapphire/50 text-white border border-white/10 rounded-full px-6 py-4 text-xs font-bold tracking-widest placeholder-white/30 focus:outline-none focus:border-turquoise text-center"
            />
            {loginError && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{loginError}</p>}
            <button type="submit" disabled={isLoggingIn} className="w-full bg-turquoise text-sapphire hover:bg-white px-6 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center shadow-[0_0_20px_rgba(48,197,210,0.3)]">
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate Identity"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-light flex">
      {/* Luxurious Sapphire Sidebar */}
      <aside className="w-72 bg-sapphire text-sand-light hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-10 pb-12 text-center">
          <h2 className="text-4xl font-serif tracking-widest text-turquoise drop-shadow-md">Talé</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-sand-light/60 mt-4 leading-relaxed">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-6 space-y-3">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path} 
                className={`flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-300 ${
                  isActive ? "bg-sand text-sapphire shadow-lg hover:bg-white" : "hover:bg-white/10 text-sand-light/70 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium tracking-[0.1em] text-sm uppercase">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6">
          <button onClick={handleLogout} className="flex items-center gap-5 px-6 py-4 w-full text-sand-light/60 hover:text-terracotta hover:bg-terracotta/10 rounded-3xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-semibold tracking-widest text-xs uppercase">Logout Access</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 border-b border-sapphire/5 flex items-center justify-end px-12 bg-white/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-sapphire font-serif text-lg shadow-sm border border-sapphire/10">
               Ad
             </div>
             <div>
               <p className="text-xs uppercase tracking-widest text-sapphire/50 font-semibold mb-1">Authenticated</p>
               <h1 className="text-sm font-semibold tracking-wide text-sapphire">System Administrator</h1>
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
