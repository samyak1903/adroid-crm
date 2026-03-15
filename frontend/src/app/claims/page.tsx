"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, ShieldAlert, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { getClaims, createClaim, updateClaim, QualityClaim, getOrders, Order, getCustomers, Customer } from "@/lib/api";

const STATUS_OPTIONS = ["Open", "Under Review", "Resolved", "Rejected"];

const STATUS_BADGE: Record<string, string> = {
  Open: "badge badge-red",
  "Under Review": "badge badge-amber",
  Resolved: "badge badge-green",
  Rejected: "badge badge-muted",
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<QualityClaim[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<QualityClaim | null>(null);

  const [form, setForm] = useState({
    order_id: 0,
    customer_id: 0,
    issue_description: "",
    claim_amount: 0,
    status: "Open",
  });

  async function loadData() {
    try {
      setLoading(true);
      const [clData, oData, cData] = await Promise.all([getClaims(), getOrders(), getCustomers()]);
      setClaims(clData);
      setOrders(oData);
      setCustomers(cData);
    } catch (error) {
      console.error("Failed to load claims", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getOrderNumber = (id: number) => {
    const o = orders.find(x => x.id === id);
    return o ? o.sc_number : "Unknown Order";
  };

  const getCustomerName = (id: number) => {
    const c = customers.find(x => x.id === id);
    return c ? c.name : "Unknown Customer";
  };

  const handleOpenCreate = () => {
    setSelectedClaim(null);
    setIsEditing(false);
    setForm({
      order_id: orders.length > 0 ? orders[0].id : 0,
      customer_id: customers.length > 0 ? customers[0].id : 0,
      issue_description: "",
      claim_amount: 0,
      status: "Open",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: QualityClaim) => {
    setSelectedClaim(c);
    setIsEditing(true);
    setForm({
      order_id: c.order_id,
      customer_id: c.customer_id,
      issue_description: c.issue_description,
      claim_amount: c.claim_amount,
      status: c.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.issue_description || !form.order_id || !form.customer_id) return;
    try {
      const dataToSave = {
        ...form,
        claim_amount: Number(form.claim_amount),
      };

      if (isEditing && selectedClaim) {
        await updateClaim(selectedClaim.id, dataToSave);
      } else {
        await createClaim(dataToSave as any);
      }
      setShowModal(false);
      setSelectedClaim(null);
      loadData();
    } catch (error) {
      console.error("Failed to save claim", error);
    }
  };

  const filtered = claims.filter(c => {
    const matchTab = activeTab === "All" || c.status === activeTab;
    const matchSearch = c.issue_description.toLowerCase().includes(search.toLowerCase()) ||
                        getOrderNumber(c.order_id).toLowerCase().includes(search.toLowerCase()) ||
                        getCustomerName(c.customer_id).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><ShieldAlert className="w-8 h-8 text-red-500" /> Quality Claims</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage customer quality issues and claims.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search claims…" className="input-field pl-9 w-48 sm:w-60 py-2 text-sm"/>
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 whitespace-nowrap">
              <AlertTriangle className="w-4 h-4"/> Log Issue
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {["All", ...STATUS_OPTIONS].map(s=>(
            <button key={s} onClick={()=>setActiveTab(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab===s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}>
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab===s ? "bg-white/20 text-white" : "bg-background"}`}>
                {s==="All" ? claims.length : claims.filter(c=>c.status===s).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading claims...</div>
        ) : (
          <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["ID", "Order / Customer", "Issue Description", "Claim Amount", "Status", "Date"].map(h=>(
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c,i)=>(
                    <motion.tr key={c.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                      onClick={()=>handleOpenEdit(c)}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group">
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">#QC-{c.id.toString().padStart(4, '0')}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold block text-primary">{getOrderNumber(c.order_id)}</span>
                        <span className="text-xs text-muted-foreground">{getCustomerName(c.customer_id)}</span>
                      </td>
                      <td className="px-5 py-4 max-w-[250px] truncate">{c.issue_description}</td>
                      <td className="px-5 py-4 font-semibold">${c.claim_amount.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`${STATUS_BADGE[c.status]} flex items-center gap-1 w-fit`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length===0 && <div className="py-20 text-center text-muted-foreground">No claims found.</div>}
          </div>
        )}

        {/* Mobile Cards for Claims */}
        {!loading && (
          <div className="md:hidden space-y-3">
            {filtered.map((c,i)=>(
              <motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                onClick={()=>handleOpenEdit(c)}
                className="glass-card rounded-xl p-4 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-primary">{getOrderNumber(c.order_id)}</p>
                    <p className="text-xs text-muted-foreground">{getCustomerName(c.customer_id)}</p>
                  </div>
                  <span className={`${STATUS_BADGE[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.issue_description}</p>
                <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Logged: {new Date(c.created_at).toLocaleDateString()}</span>
                  <span className="font-bold text-foreground text-sm">${c.claim_amount.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
            {filtered.length===0 && <div className="py-10 text-center text-muted-foreground">No claims found.</div>}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  {isEditing ? "Edit Quality Claim" : "New Quality Claim"}
                </h2>
                <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Customer</label>
                    <select className="input-field" value={form.customer_id} onChange={e=>setForm({...form, customer_id: parseInt(e.target.value)})}>
                      <option value={0} disabled>Select Customer...</option>
                      {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Order SC Number</label>
                    <select className="input-field" value={form.order_id} onChange={e=>setForm({...form, order_id: parseInt(e.target.value)})}>
                      <option value={0} disabled>Select Order...</option>
                      {orders.map(o=><option key={o.id} value={o.id}>{o.sc_number}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Issue Description / Reason</label>
                  <textarea className="input-field py-3 min-h-[100px]" value={form.issue_description} onChange={e=>setForm({...form, issue_description: e.target.value})} placeholder="Describe the quality issue, shortages, or damages..." required/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Claim Amount ($)</label>
                    <input type="number" className="input-field" value={form.claim_amount} onChange={e=>setForm({...form, claim_amount: e.target.value as any})} required/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                    <select className="input-field" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                      {STATUS_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">{isEditing ? "Save Changes" : "Submit Claim"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
