"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ChevronDown, Clock, CheckCircle, AlertCircle, XCircle, FileEdit } from "lucide-react";
import { getEnquiries, createEnquiry, updateEnquiry, Enquiry, getCustomers, Customer } from "@/lib/api";

const STATUSES = ["All", "Pending", "Pricing", "Won", "Lost", "Review"];

const STATUS_BADGE: Record<string, string> = {
  Pending: "badge badge-amber",
  Pricing: "badge badge-blue",
  Won:     "badge badge-green",
  Lost:    "badge badge-red",
  Review:  "badge badge-purple",
};

const STATUS_ICON: Record<string, JSX.Element> = {
  Pending: <Clock className="w-3 h-3" />,
  Pricing: <AlertCircle className="w-3 h-3" />,
  Won:     <CheckCircle className="w-3 h-3" />,
  Lost:    <XCircle className="w-3 h-3" />,
  Review:  <AlertCircle className="w-3 h-3" />,
};

export default function EnquiriesPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Side Panel State
  const [showModal, setShowModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    enquiry_number: "", source: "Email", customer_id: 0, products_requested: "", qty: "", status: "Pending", notes: ""
  });

  async function loadData() {
    try {
      setLoading(true);
      const [enqs, custs] = await Promise.all([getEnquiries(), getCustomers()]);
      setEnquiries(enqs);
      setCustomers(custs);
    } catch (error) {
      console.error("Failed to load enquiries or customers", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedEnquiry(null);
    setIsEditing(false);
    setForm({
      enquiry_number: `ENQ-${Date.now().toString().slice(-4)}`,
      source: "Email", customer_id: customers.length > 0 ? customers[0].id : 0, products_requested: "", qty: "", status: "Pending", notes: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setIsEditing(true);
    setForm({
      enquiry_number: enq.enquiry_number,
      source: enq.source || "Email",
      customer_id: enq.customer_id || 0,
      products_requested: enq.products_requested || "",
      qty: enq.qty || "",
      status: enq.status || "Pending",
      notes: enq.notes || ""
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.enquiry_number || form.customer_id === 0) return;
    try {
      const payload = {
        ...form,
        date: new Date().toISOString().split('T')[0] // current date for simple setup
      };
      if (isEditing && selectedEnquiry) {
        await updateEnquiry(selectedEnquiry.id, payload);
      } else {
        await createEnquiry(payload);
      }
      setShowModal(false);
      setSelectedEnquiry(null);
      loadData();
    } catch (error) {
      console.error("Failed to save enquiry", error);
    }
  };

  const getCustomerName = (cId: number | undefined) => {
    if (!cId) return "Unknown";
    const c = customers.find(x => x.id === cId);
    return c ? c.name : "Unknown";
  };

  const getCustomerCountry = (cId: number | undefined) => {
    if (!cId) return "";
    const c = customers.find(x => x.id === cId);
    return c ? c.country : "";
  };

  const filtered = enquiries.filter(e => {
    const matchStatus = activeStatus === "All" || e.status === activeStatus;
    const cName = getCustomerName(e.customer_id).toLowerCase();
    const matchSearch = cName.includes(search.toLowerCase()) ||
                        (e.products_requested || "").toLowerCase().includes(search.toLowerCase()) ||
                        e.enquiry_number.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const countFor = (s: string) => s === "All" ? enquiries.length : enquiries.filter(e=>e.status===s).length;

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Enquiries</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and respond to all incoming enquiries.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search enquiries…" className="input-field pl-9 w-48 sm:w-60 py-2 text-sm" />
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              <Plus className="w-4 h-4"/> New Enquiry
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {STATUSES.map(s => (
            <button key={s} onClick={()=>setActiveStatus(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeStatus===s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}>
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeStatus===s ? "bg-white/20 text-white" : "bg-background"}`}>
                {countFor(s)}
              </span>
            </button>
          ))}
        </div>

        {/* Table / Cards */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading enquiries...</div>
        ) : (
          <>
            <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Enquiry #","Customer","Country","Products","Qty","Source","Status","Date"].map(h=>(
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, i) => (
                      <motion.tr key={e.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                        onClick={() => setSelectedEnquiry(e)}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group">
                        <td className="px-5 py-4 font-mono text-xs text-primary font-semibold">{e.enquiry_number}</td>
                        <td className="px-5 py-4 font-medium group-hover:text-primary transition-colors">{getCustomerName(e.customer_id)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{getCustomerCountry(e.customer_id) || "-"}</td>
                        <td className="px-5 py-4 max-w-[220px] truncate text-muted-foreground">{e.products_requested || "-"}</td>
                        <td className="px-5 py-4 font-semibold">{e.qty || "-"}</td>
                        <td className="px-5 py-4 text-muted-foreground">{e.source || "-"}</td>
                        <td className="px-5 py-4">
                          <span className={`${STATUS_BADGE[e.status] || "badge"} flex items-center gap-1 w-fit`}>
                            {STATUS_ICON[e.status] || <Clock className="w-3 h-3"/>} {e.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{e.date}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">No enquiries found.</div>
              )}
            </div>

            <div className="md:hidden space-y-3">
              {filtered.map((e,i)=>(
                <motion.div key={e.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  onClick={() => setSelectedEnquiry(e)}
                  className="glass-card rounded-xl p-4 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{getCustomerName(e.customer_id)}</p>
                      <p className="text-xs text-muted-foreground font-mono">{e.enquiry_number} · {getCustomerCountry(e.customer_id)}</p>
                    </div>
                    <span className={`${STATUS_BADGE[e.status]} flex items-center gap-1`}>{STATUS_ICON[e.status]} {e.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{e.products_requested}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{e.source} · {e.date}</span>
                    <span className="font-semibold text-foreground">{e.qty}</span>
                  </div>
                </motion.div>
              ))}
              {filtered.length===0 && <div className="py-10 text-center text-muted-foreground">No enquiries found.</div>}
            </div>
          </>
        )}
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedEnquiry && !showModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={()=>setSelectedEnquiry(null)}/>
            <motion.aside initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:280}}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h2 className="font-semibold text-lg">{selectedEnquiry.enquiry_number}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{getCustomerName(selectedEnquiry.customer_id)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEdit(selectedEnquiry)} className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><FileEdit className="w-5 h-5"/></button>
                  <button onClick={()=>setSelectedEnquiry(null)} className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { l: "Status", v: <span className={`${STATUS_BADGE[selectedEnquiry.status]} flex items-center gap-1 w-fit`}>{STATUS_ICON[selectedEnquiry.status]} {selectedEnquiry.status}</span> },
                    { l: "Date", v: selectedEnquiry.date },
                    { l: "Source", v: selectedEnquiry.source || "-" },
                    { l: "Quantity", v: <span className="font-bold">{selectedEnquiry.qty || "-"}</span> },
                  ].map(row=>(
                    <div key={row.l} className="glass-card p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">{row.l}</p>
                      <div className="font-medium text-sm">{row.v}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-5 rounded-xl">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Products Requested</p>
                  <p className="font-medium">{selectedEnquiry.products_requested || "Not Specified"}</p>
                </div>
                {selectedEnquiry.notes && (
                  <div className="glass-card p-5 rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedEnquiry.notes}</p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{isEditing ? "Edit Enquiry" : "New Enquiry"}</h2>
                <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Enquiry #</label>
                    <input className="input-field" value={form.enquiry_number} onChange={e=>setForm({...form, enquiry_number: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                        {STATUSES.filter(s=>s!=="All").map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Customer</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.customer_id} onChange={e=>setForm({...form, customer_id: parseInt(e.target.value)})} required>
                        <option value={0} disabled>Select a customer...</option>
                        {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Products Requested</label>
                    <input className="input-field" placeholder="e.g. HR Coils" value={form.products_requested} onChange={e=>setForm({...form, products_requested: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Quantity</label>
                    <input className="input-field" placeholder="e.g. 5000MT" value={form.qty} onChange={e=>setForm({...form, qty: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Source</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.source} onChange={e=>setForm({...form, source: e.target.value})}>
                        {["Email","Phone","WhatsApp","Referral","Website"].map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Notes</label>
                    <textarea rows={3} className="input-field resize-none" placeholder="Additional notes or requirements…" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})}/>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">{isEditing ? "Save Changes" : "Save Enquiry"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
