"use client";

import { motion } from "framer-motion";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useProperties } from "@/hooks/useProperties";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

export default function AdminProperties() {
  const { data: properties, isLoading } = useProperties();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // Form State
  const AVAILABLE_AMENITIES = ["High-Speed Fiber", "Red Sea View", "Private Pool", "Climate Control", "Mini Bar", "Master Suite", "En-Suite Bath", "Balcony Lounge", "Private Cinema"];
  const ROOM_TYPES = ["Signature Suite", "Ocean Villa", "Penthouse", "Alpine Chalet", "Standard Room"];

  const [formData, setFormData] = useState({ 
    name: "", basePrice: "", capacity: "", description: "", 
    roomType: "Signature Suite", amenities: [] as string[] 
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) 
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Media Upload State
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", basePrice: "", capacity: "", description: "", roomType: "Signature Suite", amenities: [] });
    setPreviewImage(null);
  };

  const handleEditClick = (prop: any) => {
    setEditingId(prop._id);
    setFormData({
      name: prop.name,
      basePrice: prop.basePrice.toString(),
      capacity: prop.capacity?.toString() || "2",
      description: prop.description || "",
      roomType: prop.roomType || "Signature Suite",
      amenities: prop.amenities || []
    });
    setPreviewImage(prop.images?.[0] || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, propName: string) => {
    if (!confirm(`Are you absolutely incredibly sure you want to completely erase '${propName}'? This destroys all associated ledger records.`)) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/properties/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete intrinsically failed.");
      
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      if (editingId === id) resetForm();
    } catch (err) {
      alert("Failed to destroy configuration structure.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // UI Preview
    setPreviewImage(URL.createObjectURL(file));
    setUploading(true);

    try {
      // 1. Fetch encrypted Cloudinary Signature from our Express SKILL implementation
      const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/media/signature`);
      const { timestamp, signature, cloudName, apiKey } = await sigRes.json();

      // 2. Safely bounce user's image straight to Cloudinary bypasses node.js max limits
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "tale_properties");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Cloudinary rejected the upload (401). Real API keys are required!");

      const uploadedData = await uploadRes.json();
      console.log("Cloudinary Upload Success:", uploadedData.secure_url);
      setPreviewImage(uploadedData.secure_url); // lock to the remote URL indicating success
    } catch (error) {
      console.error("Cloudinary Error:", error);
      alert("Cloudinary Upload Failed! You need to insert your real API Keys into your database.");
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.name || !formData.basePrice) return alert("Name and Base Price are required.");
    setIsPublishing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/properties/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/properties`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          basePrice: Number(formData.basePrice),
          capacity: Number(formData.capacity) || 2,
          description: formData.description,
          images: previewImage ? [previewImage] : [],
          roomType: formData.roomType,
          amenities: formData.amenities
        })
      });
      
      if (!res.ok) throw new Error("Backend rejected operation");
      
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      resetForm();
    } catch (error) {
      alert("Failed to save to database.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-10">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-serif text-sapphire mb-4 font-light tracking-tight">Properties</h2>
          <p className="text-sapphire/70 font-light text-lg">Manage your Suites, Villas, and physical inventory classes.</p>
        </div>
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className="bg-sapphire text-white px-8 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-turquoise transition-colors flex items-center gap-3 shadow-lg"
        >
          {isAdding ? "Cancel Edits" : <><Plus className="w-4 h-4" /> Add Property</>}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-sapphire/5 border border-sapphire/5 overflow-hidden"
        >
          <h3 className="text-3xl font-serif text-sapphire mb-10 font-light">{editingId ? "Modify Configuration Specifications" : "New Configuration Setup"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Listing Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl px-6 py-4 text-sapphire font-medium focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-all" placeholder="e.g. Imperial Ocean Villa" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Base Price (EGP)</label>
                  <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl px-6 py-4 text-sapphire font-medium focus:outline-none focus:border-turquoise transition-all" placeholder="1500" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Max Capacity</label>
                  <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl px-6 py-4 text-sapphire font-medium focus:outline-none focus:border-turquoise transition-all" placeholder="4" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Structural Class</label>
                  <select value={formData.roomType} onChange={e => setFormData({ ...formData, roomType: e.target.value })} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl px-6 py-4 text-sapphire font-medium focus:outline-none focus:border-turquoise transition-all appearance-none cursor-pointer">
                     {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Curated Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_AMENITIES.map(amenity => (
                    <button type="button" key={amenity} onClick={() => toggleAmenity(amenity)} className={`px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-bold transition-all border ${formData.amenities.includes(amenity) ? 'bg-terracotta text-white border-terracotta shadow-md' : 'bg-transparent text-sapphire/40 border-sapphire/20 hover:border-sapphire/50'}`}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-sand-light/50 border border-sapphire/10 rounded-2xl px-6 py-4 text-sapphire font-medium focus:outline-none focus:border-turquoise transition-all min-h-[140px]" placeholder="Captivating views from the private terrace..." />
              </div>
            </div>
            
            <div className="flex flex-col h-full">
               <label className="block text-[10px] uppercase tracking-[0.2em] text-sapphire/60 font-bold mb-3">Media Cloud (Cloudinary)</label>
               
               {/* Hidden native input hooked up to custom beautiful styling */}
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
               />

               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="relative flex-1 bg-sand-light/30 border-2 border-dashed border-sapphire/20 rounded-[2rem] flex flex-col items-center justify-center text-sapphire/40 hover:bg-sand-light/60 hover:border-turquoise hover:text-turquoise transition-all overflow-hidden cursor-pointer group"
               >
                 {previewImage ? (
                   <>
                     <Image src={previewImage} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                     {uploading && (
                       <div className="absolute inset-0 bg-sapphire/50 flex flex-col justify-center items-center text-white backdrop-blur-sm z-10 transition-all">
                         <Loader2 className="w-10 h-10 animate-spin mb-4" />
                         <span className="text-xs uppercase tracking-widest font-bold">Secure Cloudinary Sync...</span>
                       </div>
                     )}
                     {!uploading && <ImageIcon className="w-10 h-10 absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />}
                   </>
                 ) : (
                   <>
                     <ImageIcon className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-500" />
                     <p className="font-semibold text-sm tracking-wide">Click to Securely Upload</p>
                     <p className="text-[10px] mt-4 uppercase tracking-[0.1em] font-bold opacity-60 bg-sapphire/10 text-sapphire px-4 py-1.5 rounded-full">Powered by SKILL.md Signatures</p>
                   </>
                 )}
               </div>
            </div>

          </div>
          <div className="mt-12 flex justify-end">
             <button onClick={handlePublish} disabled={isPublishing} className="bg-sand text-sapphire px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-sapphire hover:text-white transition-all shadow-lg hover:shadow-xl">
               {isPublishing ? "Synchronizing..." : editingId ? "Save Modifications" : "Publish Configuration"}
             </button>
          </div>
        </motion.div>
      )}

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        
        {isLoading && <p className="text-sapphire/50 text-xs font-bold tracking-[0.2em] uppercase py-10 col-span-3">Syncing with Talé Database...</p>}
        
        {/* HYDRATION FIX: Replaced `<p>` tag enclosing a `<span block>` with a cleanly valid DOM structure (div > div) */}
        {properties?.length === 0 && !isLoading && (
          <div className="col-span-3 py-32 bg-white border border-sapphire/5 rounded-[2.5rem] flex flex-col items-center justify-center shadow-lg shadow-sapphire/5">
            <div className="text-sapphire/50 font-semibold tracking-wide text-lg text-center">
              No properties configured yet.<br/> 
              <span className="text-sm font-light mt-2 block">Use the button above to seed the MongoDB database.</span>
            </div>
          </div>
        )}
        
        {properties?.map((prop, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            key={prop._id} 
            className="bg-white rounded-[2.5rem] shadow-xl shadow-sapphire/5 overflow-hidden border border-sapphire/5 group hover:border-turquoise/30 transition-colors"
          >
            <div className="relative h-64 w-full bg-sand-light overflow-hidden">
               {prop.images?.length > 0 ? (
                  <Image src={prop.images[0]} alt={prop.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sapphire/20"><ImageIcon className="w-12 h-12" /></div>
               )}
            </div>
            
            <div className="p-8">
               <h3 className="text-2xl font-serif text-sapphire font-light mb-2">{prop.name}</h3>
               <p className="text-terracotta text-[10px] uppercase tracking-widest font-bold mb-4">{prop.roomType}</p>
               <p className="text-sapphire/60 text-sm mb-8 leading-relaxed line-clamp-2">{prop.description || "No description provided."}</p>
               
               <div className="flex justify-between items-center pt-6 border-t border-sapphire/10">
                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-sapphire/40 mb-1">Base Rate</p>
                   <p className="text-lg font-bold text-sapphire">{prop.basePrice} EGP <span className="text-xs text-sapphire/50 ml-1 font-semibold">/NIGHT</span></p>
                 </div>
                 <div className="flex items-center gap-2">
                   <button onClick={() => handleEditClick(prop)} className="text-turquoise text-[10px] hover:bg-turquoise hover:text-white px-5 py-2.5 rounded-full uppercase tracking-[0.2em] font-bold border border-turquoise transition-all">Edit</button>
                   <button onClick={() => handleDelete(prop._id, prop.name)} disabled={isDeleting === prop._id} className="text-terracotta text-[10px] hover:bg-terracotta hover:text-white px-5 py-2.5 rounded-full uppercase tracking-[0.2em] font-bold border border-terracotta transition-all disabled:opacity-50">
                     {isDeleting === prop._id ? "Wiping..." : "Drop"}
                   </button>
                 </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
