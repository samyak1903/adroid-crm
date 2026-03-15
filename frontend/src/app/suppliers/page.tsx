"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ChevronDown, Globe, Package, DollarSign, Star, FileEdit } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier, Supplier } from "@/lib/api";

const BADGE_COLORS: Record<string, string> = {
  Manufacturer: "badge badge-blue",
  Distributor:  "badge badge-purple",
  Trader:       "badge badge-amber",
};

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [form, setForm] = useState({ name: "", country: "", type: "Manufacturer", products: "", commission: "", contact: "", email: "", rating: 5, orders: 0 });

  async function loadData() {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to load suppliers", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setIsEditing(false);
    setForm({ name: "", country: "", type: "Manufacturer", products: "", commission: "", contact: "", email: "", rating: 5, orders: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, s: Supplier) => {
    e.stopPropagation();
    setSelectedSupplier(s);
    setIsEditing(true);
    setForm({
      name: s.name,
      country: s.country || "",
      type: s.type || "Manufacturer",
      products: s.products || "",
      commission: s.commission || "",
      contact: s.contact || "",
      email: s.email || "",
      rating: s.rating || 5,
      orders: s.orders || 0,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      if (isEditing && selectedSupplier) {
        await updateSupplier(selectedSupplier.id, form);
      } else {
        await createSupplier(form);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Failed to save supplier", error);
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.country || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.products || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your manufacturer and distributor network.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search suppliers…"
                className="input-field pl-9 w-48 sm:w-64 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Supplier
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Suppliers", value: suppliers.length, icon: <Globe className="w-5 h-5 text-blue-500" /> },
            { label: "Manufacturers",   value: suppliers.filter(s=>s.type==="Manufacturer").length, icon: <Package className="w-5 h-5 text-purple-500" /> },
            { label: "Avg Commission",  value: "2.2%", icon: <DollarSign className="w-5 h-5 text-emerald-500" /> },
            { label: "Total Orders",    value: suppliers.reduce((s,x)=>s+(x.orders||0),0), icon: <Star className="w-5 h-5 text-amber-500" /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
              className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Supplier Cards */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading suppliers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-xl transition-all group relative">
                
                <button onClick={(e) => handleOpenEdit(e, s)} className="absolute top-4 right-4 p-2 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-muted text-muted-foreground hover:text-foreground">
                  <FileEdit className="w-4 h-4" />
                </button>

                <div className="flex items-start justify-between pr-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{s.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" /> {s.country || "-"}
                      </p>
                    </div>
                  </div>
                  <span className={BADGE_COLORS[s.type || "Trader"] || "badge badge-amber"}>{s.type || "Trader"}</span>
                </div>

                <div className="space-y-2 text-sm flex-1">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Products</p>
                  <p className="text-foreground">{s.products || "-"}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="font-semibold text-emerald-500">{s.commission || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-semibold">{s.orders || 0}</p>
                  </div>
                  <div className="flex">
                    {Array.from({length:5}).map((_,j)=>(
                      <Star key={j} className={`w-3.5 h-3.5 ${j<(s.rating||0) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 text-muted-foreground">No suppliers match your search.</div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{isEditing ? "Edit Supplier" : "Add New Supplier"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Company Name</label>
                    <input className="input-field" placeholder="e.g. Global Steel Works" value={form.name} onChange={e=>setForm(p=>({...p, name: e.target.value}))} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Country</label>
                    <input className="input-field" placeholder="e.g. Germany" value={form.country} onChange={e=>setForm(p=>({...p, country: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Type</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                        {["Manufacturer","Distributor","Trader"].map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Products</label>
                    <input className="input-field" placeholder="e.g. Steel Coils, Sheets" value={form.products} onChange={e=>setForm(p=>({...p, products: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Contact Person</label>
                    <input className="input-field" placeholder="e.g. Hans Mueller" value={form.contact} onChange={e=>setForm(p=>({...p, contact: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Contact Email</label>
                    <input className="input-field" placeholder="e.g. email@example.com" type="email" value={form.email} onChange={e=>setForm(p=>({...p, email: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Commission</label>
                    <input className="input-field" placeholder="e.g. 2%" value={form.commission} onChange={e=>setForm(p=>({...p, commission: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Rating (1-5)</label>
                    <input className="input-field" type="number" min="1" max="5" value={form.rating} onChange={e=>setForm(p=>({...p, rating: parseInt(e.target.value)||0}))} />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">{isEditing ? "Save Changes" : "Save Supplier"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
