"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Search, ShoppingCart, Truck, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getCustomers, getEnquiries, getOrders, getTasks, Customer, Enquiry, Order, Task } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_CLS: Record<string, string> = {
  New:     "badge badge-blue",
  Pending: "badge badge-amber",
  Won:     "badge badge-green",
  Lost:    "badge badge-red",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    customers: [] as Customer[],
    enquiries: [] as Enquiry[],
    orders: [] as Order[],
    tasks: [] as Task[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cData, eData, oData, tData] = await Promise.all([
          getCustomers(),
          getEnquiries(),
          getOrders(),
          getTasks()
        ]);
        setData({ customers: cData, enquiries: eData, orders: oData, tasks: tData });
      } catch (err) {
        console.error("Dashboard failed to load data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate KPIs
  const totalLeads = data.customers.length;
  const activeEnquiries = data.enquiries.filter(e => e.status !== "Won" && e.status !== "Lost").length;
  
  // Parse order values (assuming format like "$150,000" or just numbers)
  const ordersPipeline = data.orders.reduce((acc, o) => {
    if (!o.value_currency) return acc;
    const num = parseFloat(o.value_currency.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const pendingShipments = data.orders.filter(o => o.shipment_status !== "Delivered").length;

  // Calculate Revenue Chart Data
  const currentMonth = new Date().getMonth();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  
  // Create an array of the last 12 months, ending in the current month
  const chartLabels = Array.from({length: 12}, (_, i) => {
    const m = (currentMonth - 11 + i) % 12;
    return months[m < 0 ? m + 12 : m];
  });

  const chartData = Array(12).fill(0);

  data.orders.forEach(o => {
    if (!o.value_currency) return;
    const num = parseFloat(o.value_currency.replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) return;

    // Try to find the associated enquiry to get a date
    const enq = data.enquiries.find(e => e.id === o.enquiry_id);
    if (!enq || !enq.date) return;

    const enqDate = new Date(enq.date);
    const monthDiff = (new Date().getFullYear() - enqDate.getFullYear()) * 12 + (new Date().getMonth() - enqDate.getMonth());
    
    // If order is within the last 12 months
    if (monthDiff >= 0 && monthDiff < 12) {
      const index = 11 - monthDiff;
      chartData[index] += num;
    }
  });

  // Normalize chart data for styling (0-100 scale)
  const maxRevenue = Math.max(...chartData, 1000); // minimum scale anchor
  const normalizedChartData = chartData.map(v => (v / maxRevenue) * 100);

  const kpis = [
    { title: "Total Leads",       value: totalLeads.toString(), icon: Users,         trend: "+12.5%", up: true,  color: "text-blue-500",    bg: "bg-blue-500/10"    },
    { title: "Active Enquiries",  value: activeEnquiries.toString(), icon: Search,   trend: "+5.1%",  up: true,  color: "text-violet-500",  bg: "bg-violet-500/10"  },
    { title: "Orders Pipeline",   value: `$${(ordersPipeline / 1000).toFixed(1)}K`, icon: ShoppingCart, trend: "+18.2%", up: true,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Shipments Pending", value: pendingShipments.toString(), icon: Truck,   trend: "-2.4%",  up: false, color: "text-orange-500",  bg: "bg-orange-500/10"  },
  ];

  // Recent Enquiries
  const recentEnquiries = [...data.enquiries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map(e => {
      const cust = data.customers.find(c => c.id === e.customer_id);
      return {
        id: e.id,
        name: cust ? cust.name : "Unknown",
        product: e.products_requested || "N/A",
        time: new Date(e.date).toLocaleDateString(),
        status: e.status || "Pending"
      };
    });

  // Recent Activity (Tasks)
  const recentActivity = [...data.tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map(t => ({
      action: t.type || "Task",
      subject: t.title,
      time: new Date(t.created_at).toLocaleDateString(),
      dot: t.status === "Completed" ? "bg-emerald-500" : (t.status === "In Progress" ? "bg-amber-500" : "bg-blue-500")
    }));

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">Here&apos;s your real-time data from the CRM.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl glass-card hover:bg-muted transition-all relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"/>
            </button>
            <Link href="/profile" className="flex items-center gap-3 p-1 rounded-xl glass-card hover:bg-muted transition-all pr-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.full_name?.split(' ')[0] || "User"}</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading dashboard data...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {kpis.map((k, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-5 rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.bg}`}>
                      <k.icon className={`w-5 h-5 ${k.color}`} />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      k.up ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40"
                           : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40"
                    }`}>
                      {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {k.trend}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs font-medium mb-1">{k.title}</p>
                  <p className="text-3xl font-light tracking-tight">{k.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Revenue Chart */}
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
                className="lg:col-span-2 glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Revenue Trajectory</h3>
                  <span className="text-xs text-muted-foreground">Last 12 Months</span>
                </div>
                <div className="flex items-end gap-1.5 h-44">
                  {normalizedChartData.map((h,j)=>(
                    <div key={j} className="flex-1 flex flex-col justify-end group relative h-full">
                      {chartData[j] > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          ${(chartData[j] / 1000).toFixed(1)}K
                        </div>
                      )}
                      <motion.div
                        initial={{scaleY:0}} animate={{scaleY:1}}
                        transition={{delay:0.4+j*0.04,duration:0.4}}
                        style={{height:`${Math.max(h, 2)}%`}}
                        className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-md origin-bottom cursor-pointer hover:brightness-110 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  {chartLabels.map(m=>(
                    <span key={m} className="flex-1 text-center">{m}</span>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.4}}
                className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-5">Recent Tasks</h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((a,i)=>(
                    <div key={i} className="flex gap-3 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${a.dot} shrink-0`}/>
                      <div>
                        <p className="text-sm font-medium">{a.action}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.subject}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No recent tasks found.</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Enquiries Table */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
              className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">Recent Enquiries</h3>
                <a href="/enquiries" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3"/>
                </a>
              </div>
              <div className="space-y-2">
                {recentEnquiries.length > 0 ? recentEnquiries.map((e,i)=>(
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        {e.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.product}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground hidden sm:block">{e.time}</span>
                      <span className={STATUS_CLS[e.status] || "badge badge-muted"}>{e.status}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground p-3">No recent enquiries found.</p>
                )}
              </div>
            </motion.div>
          </>
        )}

      </div>
    </div>
  );
}
