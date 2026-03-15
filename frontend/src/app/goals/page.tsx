"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Target, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { getGoals, createGoal, updateGoal, Goal, getUsers, User } from "@/lib/api";

const STATUS_OPTIONS = ["Active", "Achieved", "Failed"];

const STATUS_BADGE: Record<string, string> = {
  Active: "badge badge-blue",
  Achieved: "badge badge-green",
  Failed: "badge badge-red",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [form, setForm] = useState({
    user_id: 0,
    title: "",
    target_value: 0,
    current_value: 0,
    deadline: "",
    status: "Active",
  });

  async function loadData() {
    try {
      setLoading(true);
      const [gData, uData] = await Promise.all([getGoals(), getUsers()]);
      setGoals(gData);
      setUsers(uData);
    } catch (error) {
      console.error("Failed to load goals", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getUserName = (id: number) => {
    const u = users.find(x => x.id === id);
    return u ? u.full_name : "Unknown Employee";
  };

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setIsEditing(false);
    setForm({
      user_id: users.length > 0 ? users[0].id : 0,
      title: "",
      target_value: 100,
      current_value: 0,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      status: "Active",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (g: Goal) => {
    setSelectedGoal(g);
    setIsEditing(true);
    setForm({
      user_id: g.user_id,
      title: g.title,
      target_value: g.target_value,
      current_value: g.current_value,
      deadline: g.deadline ? new Date(g.deadline).toISOString().split("T")[0] : "",
      status: g.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.user_id) return;
    try {
      const dataToSave = {
        ...form,
        target_value: Number(form.target_value),
        current_value: Number(form.current_value),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      };
      
      // Auto-update status if achieved
      if (dataToSave.current_value >= dataToSave.target_value && dataToSave.status === "Active") {
        dataToSave.status = "Achieved";
      }

      if (isEditing && selectedGoal) {
        await updateGoal(selectedGoal.id, dataToSave);
      } else {
        await createGoal(dataToSave as any);
      }
      setShowModal(false);
      setSelectedGoal(null);
      loadData();
    } catch (error) {
      console.error("Failed to save goal", error);
    }
  };

  const handleUpdateProgress = async (g: Goal, addedValue: number) => {
    try {
      const newValue = g.current_value + addedValue;
      const status = newValue >= g.target_value ? "Achieved" : g.status;
      await updateGoal(g.id, { current_value: newValue, status });
      loadData();
    } catch (error) {
      console.error("Failed to update progress", error);
    }
  };

  const filtered = goals.filter(g => {
    const matchTab = activeTab === "All" || g.status === activeTab;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
                        getUserName(g.user_id).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Goals & Tracking</h1>
            <p className="text-muted-foreground text-sm mt-1">Set targets and monitor team progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search goals…" className="input-field pl-9 w-48 sm:w-60 py-2 text-sm"/>
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              <Plus className="w-4 h-4"/> Set Goal
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
                {s==="All" ? goals.length : goals.filter(g=>g.status===s).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading goals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((g, i) => {
              const progress = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
              
              return (
                <motion.div key={g.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}}
                  className="glass-card rounded-2xl p-5 hover:border-border/80 transition-all flex flex-col group relative overflow-hidden">
                  
                  {/* Progress background bar effect */}
                  <div className="absolute top-0 left-0 h-1 bg-muted w-full">
                    <motion.div 
                      initial={{width: 0}} 
                      animate={{width: `${progress}%`}} 
                      transition={{duration: 1, ease: "easeOut"}}
                      className={`h-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`} 
                    />
                  </div>
                  
                  <div className="flex items-start justify-between mb-4 mt-1">
                    <span className={`${STATUS_BADGE[g.status]} text-xs`}>{g.status}</span>
                    <button onClick={() => handleOpenEdit(g)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-primary hover:underline">
                      Edit
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-lg leading-tight mb-4">{g.title}</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{g.current_value} / {g.target_value}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{width: 0}} 
                        animate={{width: `${progress}%`}} 
                        transition={{duration: 1, ease: "easeOut"}}
                        className={`h-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`} 
                      />
                    </div>
                    <p className="text-xs text-right mt-1 text-muted-foreground font-medium">{progress}% Complete</p>
                  </div>

                  {g.status === "Active" && (
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateProgress(g, 1); }} className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-lg transition-colors flex-1 flex justify-center items-center gap-1"><Plus className="w-3 h-3"/> Add 1</button>
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateProgress(g, 5); }} className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-lg transition-colors flex-1 flex justify-center items-center gap-1"><Plus className="w-3 h-3"/> Add 5</button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {getUserName(g.user_id).charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{getUserName(g.user_id)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5"/>
                      {g.deadline ? new Date(g.deadline).toLocaleDateString() : "No Date"}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && <div className="col-span-full py-20 text-center text-muted-foreground">No goals found.</div>}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{isEditing ? "Edit Goal" : "New Goal"}</h2>
                <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Goal Title</label>
                  <input className="input-field" value={form.title} autoFocus onChange={e=>setForm({...form, title: e.target.value})} required placeholder="e.g. Generate 50 Enquiries"/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Assign To Employee</label>
                    <select className="input-field" value={form.user_id} onChange={e=>setForm({...form, user_id: parseInt(e.target.value)})}>
                      <option value={0} disabled>Select User...</option>
                      {users.map(u=><option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Target Value</label>
                    <input type="number" className="input-field" value={form.target_value} onChange={e=>setForm({...form, target_value: e.target.value as any})} required/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Current Value</label>
                    <input type="number" className="input-field" value={form.current_value} onChange={e=>setForm({...form, current_value: e.target.value as any})} required/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Deadline</label>
                    <input type="date" className="input-field" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})}/>
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
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">{isEditing ? "Save Changes" : "Set Goal"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
