"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updatePassword } from "@/lib/api";
import { AlertCircle, CheckCircle2, KeyRound, Shield, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success" | null; message: string }>({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }

    setIsLoading(true);
    try {
      if (!token) throw new Error("No token available");
      await updatePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Failed to update password. Check your current password." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-muted-foreground">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and update your password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Information Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border border-border flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 text-primary flex items-center justify-center font-bold text-3xl mb-4 border border-primary/20 shadow-inner">
              {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
            <h2 className="text-xl font-bold">{user.full_name || "Employee"}</h2>
            <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 text-foreground text-sm font-semibold border border-foreground/10">
              <Shield className="w-4 h-4 text-primary" />
              {user.role}
            </span>
          </div>
        </div>

        {/* Settings Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-[2rem] border border-border">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Update Password
            </h3>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Current Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">New Password</label>
                  <input 
                    type="password" 
                    className="input-field"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="input-field"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              {status.message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 mt-4 ${status.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
