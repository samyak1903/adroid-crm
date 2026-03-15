"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 px-8 max-w-7xl mx-auto w-full z-10">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">Adroit CRM</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10 max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" /> Next-Gen Sales Pipeline
          </span>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
             Close deals faster with intelligent CRM.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
             Adroit seamlessly organizes your leads, tracks every enquiry, and manages your supplier network in one elegant interface.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link
               href="/register"
               className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-lg hover:bg-foreground/90 transition-all shadow-xl shadow-foreground/10 hover:scale-105 active:scale-95"
             >
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link
               href="/login"
               className="px-8 py-4 rounded-2xl glass-card font-bold text-lg hover:bg-white/5 transition-all"
             >
                View Demo
             </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 w-full"
        >
           <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                 <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Lead Tracking</h3>
              <p className="text-sm text-muted-foreground">Manage your prospects and turn them into long-term clients with ease.</p>
           </div>
           <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                 <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Sales Analytics</h3>
              <p className="text-sm text-muted-foreground">Deep insights into your pipeline, revenue trajectories, and conversion rates.</p>
           </div>
           <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                 <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Supplier Network</h3>
              <p className="text-sm text-muted-foreground">Keep your distributors, trading companies, and manufacturers connected.</p>
           </div>
        </motion.div>
      </main>
    </div>
  );
}
