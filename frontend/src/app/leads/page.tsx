"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Filter, Plus, Mail, Phone, MoreHorizontal, X, FileEdit, CheckCircle } from "lucide-react";
import { getCustomers, createCustomer, updateCustomer, Customer, getUsers, User } from "@/lib/api";

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [leads, setLeads] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "", country: "", email_addresses: "", region: "", priority_rating: 3, assigned_user: "", lead_stage: "Intro Sent", type: "", website: "", volume_potential: ""
  });

  const tabs = ["All", "Selected", "Intro Sent", "Connected to PM", "Qualified"];

  async function loadData() {
    try {
      setLoading(true);
      const [leadsData, usersData] = await Promise.all([getCustomers(), getUsers()]);
      setLeads(leadsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch leads or users", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedLead(null);
    setIsEditing(false);
    setForm({ name: "", country: "", email_addresses: "", region: "", priority_rating: 3, assigned_user: "", lead_stage: "Intro Sent", type: "", website: "", volume_potential: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Customer) => {
    setSelectedLead(lead);
    setIsEditing(true);
    setForm({
      name: lead.name || "",
      country: lead.country || "",
      email_addresses: lead.email_addresses || "",
      region: lead.region || "",
      priority_rating: lead.priority_rating || 3,
      assigned_user: lead.assigned_user || "",
      lead_stage: lead.lead_stage || "Intro Sent",
      type: lead.type || "",
      website: lead.website || "",
      volume_potential: lead.volume_potential || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      if (isEditing && selectedLead) {
        await updateCustomer(selectedLead.id, form);
      } else {
        await createCustomer(form);
      }
      setIsModalOpen(false);
      setSelectedLead(null);
      loadData(); // Refresh the list
    } catch (error) {
      console.error("Failed to save lead", error);
    }
  };

  const filteredLeads = activeTab === "All" ? leads : leads.filter(l => l.lead_stage === activeTab);

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20 relative flex flex-col min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Lead Management
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Organize, track, and engage with your potential customers.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm font-medium hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
            >
              {tab}
              <span className="ml-2 text-xs bg-black/30 px-2 py-0.5 rounded-full">
                {tab === "All" ? leads.length : leads.filter(l => l.lead_stage === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Leads List / Board Area */}
        <div className="flex-1 overflow-y-auto pr-2 scroll-smooth">
          {loading ? (
            <div className="text-center py-20 text-zinc-500">Loading leads...</div>
          ) : (
            <div className="grid gap-4">
              {filteredLeads.map((lead, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="glass p-5 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center font-bold border border-white/5 uppercase">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{lead.name}</h3>
                      <div className="flex flex-col gap-1.5 text-xs text-zinc-400 mt-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md text-zinc-300"><Users className="w-3 h-3" /> {lead.assigned_user || "Unassigned"}</span>
                          <span>•</span>
                          <span>{lead.region || "No Region"}</span>
                          <span>•</span>
                          <span>{lead.country || "Unknown Country"}</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest">{lead.lead_stage}</span>
                        </div>
                        {lead.email_addresses && (
                          <div className="flex items-center gap-1.5 text-zinc-300 mt-1">
                            <Mail className="w-3 h-3" /> {lead.email_addresses}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end gap-1 hidden sm:flex">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Priority Rating</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < (lead.priority_rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredLeads.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                  No leads found in this stage.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lead Detail Side Panel */}
        <AnimatePresence>
          {selectedLead && !isModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
              <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#111] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                  <div>
                    <h2 className="font-semibold text-lg text-white">{selectedLead.name}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-white/10 rounded-full">{selectedLead.lead_stage}</span>
                      {selectedLead.country && <span>{selectedLead.country}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEdit(selectedLead)} className="p-2 rounded-lg hover:bg-white/10 transition-all text-zinc-400 hover:text-white"><FileEdit className="w-4 h-4" /></button>
                    <button onClick={() => setSelectedLead(null)} className="p-2 rounded-lg hover:bg-white/10 transition-all text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Email", v: selectedLead.email_addresses || "-" },
                      { l: "Region", v: selectedLead.region || "-" },
                      { l: "Priority Rating", v: `${selectedLead.priority_rating}/5` },
                      { l: "Assigned User", v: selectedLead.assigned_user || "Unassigned" },
                      { l: "Volume Potential", v: selectedLead.volume_potential || "-" },
                      { l: "Website", v: selectedLead.website || "-" },
                    ].map(row => (
                      <div key={row.l} className="glass p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">{row.l}</p>
                        <div className="font-medium text-sm text-zinc-200 truncate" title={row.v}>{row.v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="glass p-5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-3">Activities</p>
                    <div className="flex flex-col gap-3">
                      <button className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors text-left">
                        <Plus className="w-4 h-4 text-primary" /> Add Note or Interaction
                      </button>
                      <button onClick={() => (window.location.href = "/tasks")} className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors text-left">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Create Task for Lead
                      </button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Add / Edit Lead Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Lead" : "New Lead"}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveLead} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Company Name *</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Acme Corp" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Lead Stage</label>
                      <select value={form.lead_stage} onChange={(e) => setForm({ ...form, lead_stage: e.target.value })} className="input-field appearance-none">
                        {tabs.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input type="email" value={form.email_addresses} onChange={(e) => setForm({ ...form, email_addresses: e.target.value })} className="input-field" placeholder="contact@company.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Website</label>
                      <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="www.example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Region</label>
                      <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="input-field" placeholder="e.g. North America" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Country</label>
                      <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field" placeholder="e.g. USA" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Priority Rating (1-5)</label>
                      <input type="number" min="1" max="5" value={form.priority_rating} onChange={(e) => setForm({ ...form, priority_rating: parseInt(e.target.value) || 1 })} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Assigned User</label>
                      <select value={form.assigned_user} onChange={(e) => setForm({ ...form, assigned_user: e.target.value })} className="input-field appearance-none">
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.full_name}>{u.full_name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Volume Potential</label>
                      <input type="text" value={form.volume_potential} onChange={(e) => setForm({ ...form, volume_potential: e.target.value })} className="input-field" placeholder="e.g. 5000MT/year" />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3 border-t border-white/10 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                      {isEditing ? "Save Changes" : "Create Lead"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
