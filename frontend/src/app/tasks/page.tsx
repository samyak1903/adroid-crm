"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react";
import { getTasks, createTask, updateTask, Task, getUsers, User } from "@/lib/api";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];
const TYPE_OPTIONS = ["Cold Calling", "Follow Up", "Meeting", "Other"];

const STATUS_BADGE: Record<string, string> = {
  Pending: "badge badge-amber",
  "In Progress": "badge badge-blue",
  Completed: "badge badge-green",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: 0,
    due_date: "",
    status: "Pending",
    type: "Follow Up"
  });

  async function loadData() {
    try {
      setLoading(true);
      const [tData, uData] = await Promise.all([getTasks(), getUsers()]);
      setTasks(tData);
      setUsers(uData);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getUserName = (id?: number) => {
    if (!id) return "Unassigned";
    const u = users.find(x => x.id === id);
    return u ? u.full_name : "Unknown";
  };

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setIsEditing(false);
    setForm({
      title: "",
      description: "",
      assigned_to: users.length > 0 ? users[0].id : 0,
      due_date: new Date().toISOString().split("T")[0],
      status: "Pending",
      type: "Follow Up"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t: Task) => {
    setSelectedTask(t);
    setIsEditing(true);
    setForm({
      title: t.title,
      description: t.description || "",
      assigned_to: t.assigned_to || 0,
      due_date: t.due_date ? new Date(t.due_date).toISOString().split("T")[0] : "",
      status: t.status,
      type: t.type || "Other"
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    try {
      const dataToSave = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
      };
      if (isEditing && selectedTask) {
        await updateTask(selectedTask.id, dataToSave);
      } else {
        await createTask(dataToSave);
      }
      setShowModal(false);
      setSelectedTask(null);
      loadData();
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const handleStatusToggle = async (t: Task, newStatus: string) => {
    try {
      await updateTask(t.id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filtered = tasks.filter(t => {
    const matchTab = activeTab === "All" || t.status === activeTab;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        getUserName(t.assigned_to).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage team assignments and follow-ups.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…" className="input-field pl-9 w-48 sm:w-60 py-2 text-sm"/>
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              <Plus className="w-4 h-4"/> Add Task
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
                {s==="All" ? tasks.length : tasks.filter(t=>t.status===s).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading tasks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}}
                className="glass-card rounded-2xl p-5 hover:border-border/80 transition-all flex flex-col group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`${STATUS_BADGE[t.status]} text-xs`}>{t.status}</span>
                  <button onClick={() => handleOpenEdit(t)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-primary hover:underline">
                    Edit
                  </button>
                </div>
                <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{t.description || "No description provided."}</p>
                
                <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {getUserName(t.assigned_to).charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{getUserName(t.assigned_to)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5"/>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No Date"}
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-20 text-center text-muted-foreground">No tasks found.</div>}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{isEditing ? "Edit Task" : "New Task"}</h2>
                <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Task Title</label>
                  <input className="input-field" value={form.title} autoFocus onChange={e=>setForm({...form, title: e.target.value})} required placeholder="e.g. Call Client about Order"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea className="input-field py-3 min-h-[80px]" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder="Optional details..."/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Assign To</label>
                    <select className="input-field" value={form.assigned_to} onChange={e=>setForm({...form, assigned_to: parseInt(e.target.value)})}>
                      <option value={0} disabled>Select User...</option>
                      {users.map(u=><option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Due Date</label>
                    <input type="date" className="input-field" value={form.due_date} onChange={e=>setForm({...form, due_date: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                    <select className="input-field" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                      {STATUS_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Type</label>
                    <select className="input-field" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                      {TYPE_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">{isEditing ? "Save Changes" : "Create Task"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
