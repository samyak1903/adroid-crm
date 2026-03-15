"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Users, Search, ShoppingCart, Truck, FileText,
  Sun, Moon, Menu, X, ChevronRight, CheckSquare, Target, ShieldAlert, LogOut, Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Leads", href: "/leads" },
  { icon: Search, label: "Enquiries", href: "/enquiries" },
  { icon: ShoppingCart, label: "Orders", href: "/orders" },
  { icon: Truck, label: "Suppliers", href: "/suppliers" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: ShieldAlert, label: "Quality Claims", href: "/claims" },
  { icon: FileText, label: "Documents", href: "/documents" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => setMounted(true), []);

  if (["/", "/login", "/register"].includes(pathname)) {
    return null;
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} onClick={onClick}>
            <motion.div
              whileHover={{ x: 3 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                ? "bg-primary/15 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );

  const ThemeBtn = () => (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
    >
      {mounted ? (
        theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />
      ) : (
        <div className="w-5 h-5 shrink-0" />
      )}
      <span>{mounted ? (theme === "dark" ? "Dark Mode" : "Light Mode") : "Theme"}</span>
    </button>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 h-screen border-r border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
            A
          </div>
          <span className="font-semibold text-base tracking-tight">Adroit CRM</span>
        </div>

        <NavList />

        <div className="px-3 pb-4 border-t border-border pt-3 space-y-2">
          <ThemeBtn />
          {user && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold truncate">{user.full_name || "Employee"}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Link href="/profile" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <Settings className="w-4 h-4" />
                </Link>
                <button onClick={logout} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between h-14 px-4 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <span className="font-semibold text-sm">Adroit CRM</span>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          )}
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── MOBILE DRAWER ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-card border-r border-border shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-sm">A</div>
                  <span className="font-semibold">Adroit CRM</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavList onClick={() => setMobileOpen(false)} />
              <div className="px-3 pb-5 border-t border-border pt-3 space-y-2">
                <ThemeBtn />
                {user && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-semibold truncate">{user.full_name || "Employee"}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/profile" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                        <Settings className="w-5 h-5" />
                      </Link>
                      <button onClick={logout} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
