"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(e.currentTarget);
    try {
      await login(formData);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleForgotPassword = () => {
    setError("");
    setMessage("Please contact your system administrator to reset your password.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 p-3 rounded-full hover:bg-white/5 transition-colors text-muted-foreground flex items-center gap-2 text-sm font-medium z-10">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <div className="glass-card w-full max-w-md p-8 sm:p-10 rounded-[2rem] z-10">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Enter your credentials to access your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                name="username"
                type="email" 
                placeholder="you@company.com" 
                className="input-field pl-11"
                required
                defaultValue="admin@adroit.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary border-white/20 bg-black/20" defaultChecked />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <button type="button" onClick={handleForgotPassword} className="font-medium text-primary hover:underline">Forgot password?</button>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          {message && <p className="text-emerald-500 text-sm font-medium">{message}</p>}

          <button disabled={isLoading} type="submit" className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all mt-4 disabled:opacity-50">
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-foreground hover:text-primary transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
