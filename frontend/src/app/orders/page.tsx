"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ChevronDown, Ship, FileText, CheckCircle, Clock, AlertCircle, Package, FileEdit } from "lucide-react";
import { getOrders, createOrder, updateOrder, Order, getEnquiries, Enquiry, getSuppliers, Supplier, getCustomers, Customer } from "@/lib/api";

const SHIP_STATUSES = ["All", "Production", "Shipped", "On Hold", "Delivered", "Cancelled"];

const SHIP_BADGE: Record<string, string> = {
  Production: "badge badge-blue",
  Shipped:    "badge badge-purple",
  "On Hold":  "badge badge-amber",
  Delivered:  "badge badge-green",
  Cancelled:  "badge badge-red",
};

const PAY_BADGE: Record<string, string> = {
  Paid:    "badge badge-green",
  Pending: "badge badge-amber",
  "LC Open": "badge badge-blue",
  Overdue: "badge badge-red",
};

const ICON_MAP: Record<string, JSX.Element> = {
  Shipped:    <Ship className="w-3 h-3"/>,
  Production: <Package className="w-3 h-3"/>,
  "On Hold":  <AlertCircle className="w-3 h-3"/>,
  Delivered:  <CheckCircle className="w-3 h-3"/>,
  Cancelled:  <X className="w-3 h-3"/>,
};

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    sc_number: "", enquiry_id: 0, supplier_id: 0, qty: "", value_currency: "", delivery_terms: "", payment_mode: "Pending", shipment_status: "Production", payment_status: "Pending"
  });

  async function loadData() {
    try {
      setLoading(true);
      const [oData, eData, sData, cData] = await Promise.all([
        getOrders(), getEnquiries(), getSuppliers(), getCustomers()
      ]);
      setOrders(oData);
      setEnquiries(eData);
      setSuppliers(sData);
      setCustomers(cData);
    } catch (error) {
      console.error("Failed to load orders data", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getEnquiry = (id?: number) => enquiries.find(e => e.id === id);
  const getCustomerName = (enquiryId?: number) => {
    const enq = getEnquiry(enquiryId);
    if (!enq) return "Unknown";
    const c = customers.find(x => x.id === enq.customer_id);
    return c ? c.name : "Unknown";
  };
  const getSupplierName = (id?: number) => {
    const s = suppliers.find(x => x.id === id);
    return s ? s.name : "Unknown";
  };

  const handleOpenCreate = () => {
    setSelectedOrder(null);
    setIsEditing(false);
    setForm({
      sc_number: `SC-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      enquiry_id: enquiries.length > 0 ? enquiries[0].id : 0,
      supplier_id: suppliers.length > 0 ? suppliers[0].id : 0,
      qty: "", value_currency: "", delivery_terms: "", payment_mode: "LC Open", shipment_status: "Production", payment_status: "Pending"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (o: Order) => {
    setSelectedOrder(o);
    setIsEditing(true);
    setForm({
      sc_number: o.sc_number,
      enquiry_id: o.enquiry_id || 0,
      supplier_id: o.supplier_id || 0,
      qty: o.qty || "",
      value_currency: o.value_currency || "",
      delivery_terms: o.delivery_terms || "",
      payment_mode: o.payment_mode || "LC Open",
      shipment_status: o.shipment_status || "Production",
      payment_status: o.payment_status || "Pending"
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sc_number || !form.enquiry_id || !form.supplier_id) return;
    try {
      if (isEditing && selectedOrder) {
        await updateOrder(selectedOrder.id, form);
      } else {
        await createOrder(form);
      }
      setShowModal(false);
      setSelectedOrder(null);
      loadData();
    } catch (error) {
      console.error("Failed to save order", error);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = activeStatus === "All" || o.shipment_status === activeStatus;
    const cName = getCustomerName(o.enquiry_id).toLowerCase();
    const sName = getSupplierName(o.supplier_id).toLowerCase();
    const matchSearch = cName.includes(search.toLowerCase()) ||
                        o.sc_number.toLowerCase().includes(search.toLowerCase()) ||
                        sName.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const parseValue = (v: string | undefined) => {
    if (!v) return 0;
    const num = Number(v.replace(/[^\d.-]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const total = orders.reduce((sum, o) => sum + parseValue(o.value_currency), 0);

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">Track sales contracts, shipments, and payments.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders…" className="input-field pl-9 w-48 sm:w-60 py-2 text-sm"/>
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              <Plus className="w-4 h-4"/> New Order
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {label:"Total Orders",    value: orders.length,    icon:<FileText className="w-5 h-5 text-blue-500"/>},
            {label:"Pipeline Value",  value:`$${(total/1000).toFixed(0)}K`, icon:<CheckCircle className="w-5 h-5 text-emerald-500"/>},
            {label:"Shipped",         value: orders.filter(o=>o.shipment_status==="Shipped").length, icon:<Ship className="w-5 h-5 text-purple-500"/>},
            {label:"Pending Payment", value: orders.filter(o=>o.payment_status==="Pending"||o.payment_status==="LC Open").length, icon:<Clock className="w-5 h-5 text-amber-500"/>},
          ].map((s,i)=>(
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

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {SHIP_STATUSES.map(s=>(
            <button key={s} onClick={()=>setActiveStatus(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeStatus===s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}>
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeStatus===s ? "bg-white/20 text-white" : "bg-background"}`}>
                {s==="All" ? orders.length : orders.filter(o=>o.shipment_status===s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop Table / Mobile Cards */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading orders...</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["SC Number","Customer","Supplier","Product / Qty","Value","Shipment","Payment","Terms"].map(h=>(
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o,i)=>(
                      <motion.tr key={o.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                        onClick={()=>setSelectedOrder(o)}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group">
                        <td className="px-5 py-4 font-mono text-xs text-primary font-semibold">{o.sc_number}</td>
                        <td className="px-5 py-4 font-medium group-hover:text-primary transition-colors">{getCustomerName(o.enquiry_id)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{getSupplierName(o.supplier_id)}</td>
                        <td className="px-5 py-4 max-w-[180px] truncate text-muted-foreground">
                          {getEnquiry(o.enquiry_id)?.products_requested || "-"}
                          <span className="block text-xs font-semibold">{o.qty || "-"}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold">{o.value_currency || "-"}</td>
                        <td className="px-5 py-4">
                          <span className={`${SHIP_BADGE[o.shipment_status || "Production"]} flex items-center gap-1 w-fit`}>
                            {ICON_MAP[o.shipment_status || "Production"]} {o.shipment_status || "Production"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`${PAY_BADGE[o.payment_status || "Pending"]} w-fit badge`}>{o.payment_status || "Pending"}</span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                          {o.delivery_terms || "-"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length===0 && <div className="py-20 text-center text-muted-foreground">No orders found.</div>}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((o,i)=>(
                <motion.div key={o.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                  onClick={()=>setSelectedOrder(o)}
                  className="glass-card rounded-xl p-4 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{getCustomerName(o.enquiry_id)}</p>
                      <p className="text-xs text-muted-foreground font-mono">{o.sc_number}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`${SHIP_BADGE[o.shipment_status || "Production"]} flex items-center gap-1`}>{ICON_MAP[o.shipment_status || "Production"]} {o.shipment_status}</span>
                      <span className={`${PAY_BADGE[o.payment_status || "Pending"]} badge`}>{o.payment_status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{getEnquiry(o.enquiry_id)?.products_requested || "Products not matched"} ({o.qty})</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{o.delivery_terms || "-"}</span>
                    <span className="font-bold text-foreground">{o.value_currency || "-"}</span>
                  </div>
                </motion.div>
              ))}
              {filtered.length===0 && <div className="py-10 text-center text-muted-foreground">No orders found.</div>}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Side Panel */}
      <AnimatePresence>
        {selectedOrder && !showModal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={()=>setSelectedOrder(null)}/>
            <motion.aside initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:280}}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h2 className="font-semibold text-lg">{selectedOrder.sc_number}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{getCustomerName(selectedOrder.enquiry_id)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEdit(selectedOrder)} className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><FileEdit className="w-5 h-5"/></button>
                  <button onClick={()=>setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {l:"Shipment Status", v:<span className={`${SHIP_BADGE[selectedOrder.shipment_status || "Production"]} flex items-center gap-1`}>{ICON_MAP[selectedOrder.shipment_status || "Production"]}{selectedOrder.shipment_status}</span>},
                    {l:"Payment Status",  v:<span className={`${PAY_BADGE[selectedOrder.payment_status || "Pending"]} badge`}>{selectedOrder.payment_status}</span>},
                    {l:"Order Value",     v:<span className="font-bold text-lg">{selectedOrder.value_currency || "-"}</span>},
                    {l:"Delivery Terms",  v:selectedOrder.delivery_terms || "-"},
                    {l:"Payment Mode",    v:selectedOrder.payment_mode || "-"},
                    {l:"Quantity",        v:<span className="font-mono text-sm">{selectedOrder.qty || "-"}</span>},
                  ].map(row=>(
                    <div key={row.l} className="glass-card p-3 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">{row.l}</p>
                      <div className="font-medium text-sm">{row.v}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Product & Supplier</p>
                  <p className="font-medium">{getEnquiry(selectedOrder.enquiry_id)?.products_requested || "-"}</p>
                  <p className="text-sm text-muted-foreground mt-1">Supplier: {getSupplierName(selectedOrder.supplier_id)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Enquiry #: {getEnquiry(selectedOrder.enquiry_id)?.enquiry_number || "-"}</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Documents</p>
                  {["Sales Contract","Commercial Invoice","BL Copy","LC Draft"].map(doc=>(
                    <div key={doc} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary"/>{doc}</div>
                      <button className="text-xs text-primary font-semibold hover:underline">Upload</button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* New/Edit Order Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{isEditing ? "Edit Order" : "New Order"}</h2>
                <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">SC / Order Number</label>
                    <input className="input-field" placeholder="e.g. SC-2024-007" value={form.sc_number} onChange={e=>setForm({...form, sc_number: e.target.value})} required/>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Source Enquiry (Customer)</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8 bg-muted/50" value={form.enquiry_id} onChange={e=>setForm({...form, enquiry_id: parseInt(e.target.value)})} disabled={isEditing}>
                        <option value={0} disabled>Select Enquiry...</option>
                        {enquiries.map(enq => (
                          <option key={enq.id} value={enq.id}>
                            {enq.enquiry_number} - {getCustomerName(enq.customer_id)} ({enq.products_requested?.slice(0, 20)}...)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Supplier</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8 bg-muted/50" value={form.supplier_id} onChange={e=>setForm({...form, supplier_id: parseInt(e.target.value)})} disabled={isEditing}>
                        <option value={0} disabled>Select Supplier...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Quantity</label>
                    <input className="input-field" placeholder="e.g. 5000MT" value={form.qty} onChange={e=>setForm({...form, qty: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Order Value</label>
                    <input className="input-field" placeholder="e.g. $180,000" value={form.value_currency} onChange={e=>setForm({...form, value_currency: e.target.value})}/>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Delivery Terms / Port</label>
                    <input className="input-field" placeholder="e.g. CIF Hamburg" value={form.delivery_terms} onChange={e=>setForm({...form, delivery_terms: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Payment Mode</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.payment_mode} onChange={e=>setForm({...form, payment_mode: e.target.value})}>
                        {["LC at Sight","LC 30 Days","TT in Advance","TT after Shipment","CAD", "Pending"].map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Shipment Status</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.shipment_status} onChange={e=>setForm({...form, shipment_status: e.target.value})}>
                        {SHIP_STATUSES.filter(s=>s!=="All").map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Payment Status</label>
                    <div className="relative">
                      <select className="input-field appearance-none pr-8" value={form.payment_status} onChange={e=>setForm({...form, payment_status: e.target.value})}>
                        {Object.keys(PAY_BADGE).map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>

                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">{isEditing ? "Save Changes" : "Create Order"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
