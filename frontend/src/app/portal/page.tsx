"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { UserCircle, KeyRound, Mail, ArrowRight, Loader2, Calendar as CalendarIcon, MapPin, Coffee, ArrowLeft, Settings, Luggage, Camera, Check, CreditCard } from "lucide-react";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { apiUrl } from "@/lib/api";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { guestSignInUrl, sanitizeReturnPath, shouldRedirectGuestToSignIn } from "@/lib/guestReturnTo";

interface GuestProfile {
  name?: string;
  email?: string;
  avatar?: string;
}

interface ReservationCard {
  _id: string;
  bookingCode?: string;
  status: string;
  paymentStatus?: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  paymentGatewayReference?: string;
  propertyId?: {
    name?: string;
    roomType?: string;
    images?: string[];
  };
}

function GuestPortalInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  // Auth Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'journeys' | 'profile'>('journeys');
  const [reservations, setReservations] = useState<ReservationCard[]>([]);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [fetchingData, setFetchingData] = useState(true);

  // Profile Update State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState(""); // optional update
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
       setErrorMsg("Social Login Attempt Failed.");
    }

    const activeToken = localStorage.getItem('guestToken');
    if (activeToken) {
      setToken(activeToken);
      fetchDashboard(activeToken);
    } else {
      setFetchingData(false);
    }
  }, [searchParams]);

  const fetchDashboard = async (authToken: string) => {
    try {
      const [resProfile, resLedger] = await Promise.all([
         fetch(apiUrl("/api/auth/profile"), { headers: { "Authorization": `Bearer ${authToken}` } }),
         fetch(apiUrl("/api/inventory/my-reservations"), { headers: { "Authorization": `Bearer ${authToken}` } })
      ]);
      
      if (!resProfile.ok) throw new Error("Auth block");
      
      const profData = (await resProfile.json()) as GuestProfile;
      const legData = (await resLedger.json()) as ReservationCard[];
      
      setProfile(profData);
      setEditName(profData.name || "");
      setEditEmail(profData.email || "");
      setAvatarPreview(profData.avatar || "");
      
      setReservations(legData);
    } catch {
      localStorage.removeItem('guestToken');
      setToken(null);
    } finally {
      setFetchingData(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const endpoint = isLogin ? "login" : "register";
    try {
      const res = await fetch(apiUrl(`/api/auth/${endpoint}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isLogin ? { email, password } : { name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('guestToken', data.token);
        const returnTo = sanitizeReturnPath(searchParams.get("returnTo"));
        if (returnTo) {
          router.replace(returnTo);
          return;
        }
        setToken(data.token);
        setFetchingData(true);
        fetchDashboard(data.token);
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg("Mainframe currently unreachable.");
    }
    setIsLoading(false);
  };

  const handleGoogleOAuth = () => {
    const rt = sanitizeReturnPath(searchParams.get("returnTo"));
    if (rt) sessionStorage.setItem("guestReturnTo", rt);
    else sessionStorage.removeItem("guestReturnTo");
    window.location.href = apiUrl("/api/auth/google");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
      // Securely passing the target destination folder to retrieve a perfectly matching hash
      const sigRes = await fetch(`${apiUrl("/api/media/signature")}?folder=tale_avatars`);
      const { timestamp, signature, cloudName, apiKey } = await sigRes.json();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp);
      uploadData.append("signature", signature);
      uploadData.append("folder", "tale_avatars");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error("Upload Failed");
      const finalData = await uploadRes.json();
      setAvatarPreview(finalData.secure_url);
    } catch {
      alert("Cloudinary Upload Failed. Check API configuration.");
      setAvatarPreview(profile?.avatar ?? null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const submitProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(apiUrl("/api/auth/profile"), {
         method: "PUT",
         headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
         },
         body: JSON.stringify({
            name: editName,
            email: editEmail,
            avatar: avatarPreview,
            ...(editPassword ? { password: editPassword } : {})
         })
      });
      if (!res.ok) throw new Error("Update rejected");
      const updatedProfile = (await res.json()) as GuestProfile;
      setProfile(updatedProfile);
      setEditPassword("");
      alert("Profile Successfully Updated!");
    } catch {
      alert("Failed to update profile configurations.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('guestToken');
    setToken(null);
  };

  const handlePayReservation = async (reservationId: string) => {
    if (!token) return;
    setPayingId(reservationId);
    try {
      const payRes = await fetch(apiUrl("/api/payment/checkout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationId }),
      });
      const data = await payRes.json();
      if (!payRes.ok) {
        if (shouldRedirectGuestToSignIn(payRes, data)) {
          router.push(guestSignInUrl(pathname));
          return;
        }
        alert(data.message || data.error || "Payment could not be started.");
        return;
      }
      if (data.iframe_url) {
        window.location.href = data.iframe_url;
      } else {
        alert(data.message || "Configure PayMob in the backend to enable checkout.");
      }
    } catch {
      alert("Payment could not be started. Check your connection.");
    } finally {
      setPayingId(null);
    }
  };

  const reservationStatusLabel = (res: ReservationCard) => {
    switch (res.status) {
      case "PendingApproval":
        return "Awaiting admin approval";
      case "ApprovedAwaitingPayment":
        return "Approved — payment due";
      case "Confirmed":
        return "Confirmed";
      case "Rejected":
        return "Declined";
      case "Cancelled":
        return "Cancelled";
      default:
        return res.status;
    }
  };

  // ---------------------------------------------
  // RENDER PANE 1: AUTHENTICATION
  // ---------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-full h-[60vh] bg-sapphire rounded-bl-[10rem] -z-10 shadow-2xl overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d40d886d?q=80&w=2000')] bg-cover opacity-20 mix-blend-overlay" />
        </div>
        
        <Link
          href="/"
          className="absolute top-10 left-10 flex items-center gap-3 text-white hover:text-turquoise transition-colors z-20 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
        {sanitizeReturnPath(searchParams.get("returnTo")) && (
          <p className="absolute top-10 right-10 z-20 max-w-xs text-right text-[10px] uppercase tracking-widest text-white/80">
            After sign-in you&apos;ll return to your previous page.
          </p>
        )}
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/95 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-md border border-white relative z-10 w-full">
          <div className="flex justify-center mb-8">
            <SiteLogo href="/" variant="onLight" wrapperClassName="h-28 w-[22rem] sm:h-32 sm:w-[26rem]" priority />
          </div>
          <div className="w-20 h-20 bg-sapphire text-sand-light rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
             <UserCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif text-sapphire text-center mb-2 tracking-tight">{isLogin ? "Welcome Back" : "Guest Registration"}</h1>
          <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-sapphire/50 mb-8">{isLogin ? "Access Your Private Ledger" : "Begin Your Talé Journey"}</p>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <UserCircle className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-sapphire/40" />
                <input type="text" placeholder="Full Reservation Name" value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-sand-light/30 border border-sapphire/10 rounded-full py-4 pl-14 pr-6 text-sm text-sapphire outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-all font-medium" />
              </div>
            )}
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-sapphire/40" />
              <input type="email" placeholder="Registered Email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-sand-light/30 border border-sapphire/10 rounded-full py-4 pl-14 pr-6 text-sm text-sapphire outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-all font-medium" />
            </div>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-sapphire/40" />
              <input type="password" placeholder="Passkey" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-sand-light/30 border border-sapphire/10 rounded-full py-4 pl-14 pr-6 text-sm text-sapphire outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-all font-medium" />
            </div>
            
            {errorMsg && <p className="text-center text-red-500 text-[10px] uppercase tracking-widest font-bold">{errorMsg}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full bg-sapphire text-white hover:bg-turquoise py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(6,64,90,0.2)]">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? "Secure Login" : "Create Profile"} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="flex items-center gap-4 my-8">
             <div className="h-[1px] bg-sapphire/10 flex-1" />
             <span className="text-[9px] uppercase tracking-widest text-sapphire/30 font-bold">Or continue with Google</span>
             <div className="h-[1px] bg-sapphire/10 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleOAuth}
            className="w-full bg-white border border-sapphire/10 py-3.5 rounded-full flex justify-center items-center gap-3 hover:bg-sand-light transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-xs font-semibold text-sapphire/80">Google</span>
          </button>
          
          <div className="mt-8 text-center border-t border-sapphire/5 pt-6">
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} className="text-[10px] uppercase font-bold tracking-[0.2em] text-sapphire/60 hover:text-turquoise transition-colors">
              {isLogin ? "No account yet? Register Here" : "Already registered? Login Instead"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------
  // RENDER PANE 2: THE DASHBOARD / PROFILE
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-sand-light font-sans pb-32">
       {/* Hero Navigation Slice */}
       <div className="h-[35vh] bg-sapphire relative flex flex-col justify-center px-6 md:px-20 overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d40d886d?q=80&w=2000')] bg-cover opacity-20 mix-blend-overlay" />
         <div className="absolute inset-0 bg-gradient-to-t from-sapphire to-transparent" />
         <div className="absolute top-6 left-6 md:top-8 md:left-20 z-20">
           <SiteLogo href="/" variant="onDark" wrapperClassName="h-20 w-64" />
         </div>
         <div className="relative z-10 flex justify-between items-end w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden relative shadow-2xl bg-sapphire">
                  {profile?.avatar ? (
                     <Image src={profile.avatar} alt="Avatar" fill sizes="96px" className="object-cover" />
                  ) : (
                     <UserCircle className="w-full h-full text-sand-light/50 p-2" />
                  )}
               </div>
               <div>
                  <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-none mb-2">{profile?.name || "Esteemed Guest"}</h1>
                  <p className="text-turquoise/80 text-[10px] font-bold tracking-[0.2em] uppercase">{profile?.email}</p>
               </div>
            </div>
            <button onClick={handleLogout} className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-sapphire rounded-full text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 transition-all shadow-xl">
               Logout Securely
            </button>
         </div>
       </div>

       {/* Floating Toggle Controls */}
       <div className="max-w-7xl mx-auto px-6 md:px-20 -mt-8 relative z-30 mb-12">
          <div className="bg-white p-2 rounded-full inline-flex shadow-xl shadow-sapphire/10 border border-sapphire/5">
             <button onClick={() => setActiveTab('journeys')} className={`px-6 md:px-10 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'journeys' ? 'bg-sapphire text-white' : 'text-sapphire/50 hover:bg-sand-light'}`}>
               <Luggage className="w-4 h-4" /> Travel Portfolio
             </button>
             <button onClick={() => setActiveTab('profile')} className={`px-6 md:px-10 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-sapphire text-white' : 'text-sapphire/50 hover:bg-sand-light'}`}>
               <Settings className="w-4 h-4" /> Account Design
             </button>
          </div>
       </div>

       {/* Tab Content Rendering */}
       <div className="max-w-7xl mx-auto px-6 md:px-20">
         
         {fetchingData ? (
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-sapphire/5 animate-pulse space-y-8" aria-busy="true" aria-label="Loading guest data">
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="h-48 w-48 rounded-full bg-sand/60 mx-auto md:mx-0" />
                  <div className="flex-1 space-y-4 pt-4">
                     <div className="h-4 w-40 bg-sand/40 rounded" />
                     <div className="h-10 w-full max-w-md bg-sand/50 rounded-xl" />
                     <div className="h-10 w-full max-w-sm bg-sand/40 rounded-xl" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((k) => (
                     <div key={k} className="h-56 rounded-[2rem] bg-sand/40" />
                  ))}
               </div>
            </div>
         ) : activeTab === 'profile' ? (
            
            /* PROFILE CONFIGURATION PANE */
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-sapphire/5 max-w-4xl">
               <h3 className="text-3xl font-serif text-sapphire mb-10">Account Settings</h3>
               <form onSubmit={submitProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-sapphire/40 mb-2">Display Name</label>
                        <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl p-4 text-sapphire font-medium focus:outline-none focus:border-turquoise" />
                     </div>
                     <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-sapphire/40 mb-2">Primary Email</label>
                        <input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl p-4 text-sapphire font-medium focus:outline-none focus:border-turquoise" />
                     </div>
                     <div className="pt-4 border-t border-sapphire/5">
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-sapphire/40 mb-2">Reforge Passkey (Optional)</label>
                        <input type="password" placeholder="Leave strictly blank to keep current" value={editPassword} onChange={e=>setEditPassword(e.target.value)} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl p-4 text-sapphire font-medium focus:outline-none focus:border-turquoise" />
                     </div>
                  </div>

                  <div className="flex flex-col h-full">
                     <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-sapphire/40 mb-2">Profile Avatar Media</label>
                     <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
                     <div onClick={() => fileInputRef.current?.click()} className="flex-1 min-h-[250px] bg-sand-light/30 border-2 border-dashed border-sapphire/20 rounded-[2rem] flex flex-col items-center justify-center text-sapphire/40 hover:bg-sand-light/60 transition-all cursor-pointer relative overflow-hidden group">
                        {avatarPreview ? (
                           <>
                              <Image src={avatarPreview} alt="Avatar Preview" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                              {uploadingAvatar && <Loader2 className="w-10 h-10 animate-spin absolute z-10 text-white" />}
                              {!uploadingAvatar && <Camera className="w-10 h-10 absolute z-10 opacity-0 group-hover:opacity-100 text-sapphire" />}
                           </>
                        ) : (
                           <>
                              <Camera className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                              <p className="text-xs font-bold tracking-widest uppercase">Select Image</p>
                           </>
                        )}
                     </div>
                     <div className="mt-8 flex justify-end">
                        <button type="submit" disabled={isUpdating || uploadingAvatar} className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                           {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save Specifications</>}
                        </button>
                     </div>
                  </div>
               </form>
            </motion.div>

         ) : reservations.length === 0 ? (
            
            /* EMPTY STATE PANE */
            <div className="bg-white p-24 rounded-[3rem] shadow-2xl border border-sapphire/5 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-sand rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <MapPin className="w-10 h-10 text-sapphire/40" />
               </div>
               <h3 className="text-3xl font-serif text-sapphire mb-3">No Active Journeys</h3>
               <p className="text-sapphire/50 text-sm max-w-md mx-auto mb-10 leading-relaxed">Your ledger is completely blank. The pristine beaches of Galala City elegantly await your absolute ultimate discovery.</p>
               <Link href="/" className="px-10 py-5 bg-sapphire text-white rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-turquoise transition-all shadow-xl shadow-sapphire/20 flex items-center gap-3">
                 Explore Suites <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

         ) : (

            /* LEDGER RENDER PANE */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {reservations.map((res, i) => (
                 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} key={res._id} className="bg-white rounded-[2.5rem] shadow-xl shadow-sapphire/5 border border-sapphire/5 overflow-hidden group">
                   <div className="relative aspect-video w-full bg-sand-light overflow-hidden">
                     <Image src={res.propertyId?.images?.[0] || "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2"} alt="Suite" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg max-w-[min(100%,14rem)]">
                        <span className={`text-[9px] font-bold uppercase tracking-widest leading-tight block ${res.status === 'Confirmed' ? 'text-emerald-600' : res.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>{reservationStatusLabel(res)}</span>
                     </div>
                   </div>
                   <div className="p-8">
                      <h4 className="text-2xl font-serif text-sapphire leading-tight mb-2">{res.propertyId?.name || "Unknown Suite"}</h4>
                      <p className="text-[10px] text-sapphire/50 font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-8"><Coffee className="w-3 h-3" /> {res.propertyId?.roomType || "Luxury Property"}</p>
                      
                      <div className="bg-sand-light/50 rounded-3xl p-6 border border-sapphire/5 space-y-4">
                         <div className="flex items-center gap-4">
                            <CalendarIcon className="w-5 h-5 text-turquoise" />
                            <div>
                               <p className="text-xs text-sapphire/40 font-bold tracking-widest uppercase mb-1">Check-In</p>
                               <p className="font-semibold text-sapphire">{new Date(res.checkInDate).toLocaleDateString('end-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 border-t border-sapphire/10 pt-4">
                            <CalendarIcon className="w-5 h-5 text-terracotta" />
                            <div>
                               <p className="text-xs text-sapphire/40 font-bold tracking-widest uppercase mb-1">Check-Out</p>
                               <p className="font-semibold text-sapphire">{new Date(res.checkOutDate).toLocaleDateString('end-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-6 space-y-2">
                         <p className="text-[9px] uppercase tracking-widest text-sapphire/40 font-bold">Booking ID</p>
                         <p className="font-mono text-sm font-semibold text-sapphire">{res.bookingCode || res._id}</p>
                         <p className="text-[9px] uppercase tracking-widest text-sapphire/40 font-bold pt-2">Payment</p>
                         <p className="text-xs font-medium text-sapphire/80 capitalize">{res.paymentStatus || (res.status === 'Confirmed' ? 'paid' : 'unpaid')}</p>
                      </div>

                      <div className="mt-6 flex justify-between items-end gap-4 flex-wrap">
                         <div>
                            <p className="text-[9px] uppercase tracking-widest text-sapphire/40 font-bold mb-1">Total</p>
                            <p className="text-xl font-bold text-sapphire">{res.totalPrice.toLocaleString()} EGP</p>
                         </div>
                         {res.status === "ApprovedAwaitingPayment" && (
                           <button
                             type="button"
                             disabled={payingId === res._id}
                             onClick={() => handlePayReservation(res._id)}
                             className="flex items-center gap-2 bg-sapphire text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-turquoise transition-colors disabled:opacity-60"
                           >
                             {payingId === res._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                             Pay now
                           </button>
                         )}
                      </div>
                   </div>
                 </motion.div>
               ))}
            </div>
         )}
       </div>
    </div>
  );
}

export default function GuestPortal() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sand-light flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-sapphire" />
        </div>
      }
    >
      <GuestPortalInner />
    </Suspense>
  );
}
