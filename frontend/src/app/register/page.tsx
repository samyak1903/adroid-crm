"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Lock, Mail, Building2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate register
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 p-3 rounded-full hover:bg-white/5 transition-colors text-muted-foreground flex items-center gap-2 text-sm font-medium z-10">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <div className="glass-card w-full max-w-xl p-8 sm:p-10 rounded-[2rem] z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-muted-foreground text-sm">Start your free trial today. No credit card required.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="John Doe" className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Company</label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Acme Inc." className="input-field pl-11" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Work Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" placeholder="john@acme.com" className="input-field pl-11" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="password" placeholder="••••••••" className="input-field pl-11" required />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all mt-6">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
