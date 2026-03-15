"use client";

import { motion } from "framer-motion";
import { FileText, Upload, FolderOpen } from "lucide-react";

export default function DocumentsPage() {
  const categories = [
    { label: "Enquiry Mails",        count: 24, icon: "📧" },
    { label: "Sales Contracts",       count: 18, icon: "📄" },
    { label: "Letters of Credit",     count: 9,  icon: "💳" },
    { label: "Commission Agreements", count: 6,  icon: "🤝" },
    { label: "Copy Documents",        count: 31, icon: "📋" },
    { label: "Visiting Cards",        count: 57, icon: "👤" },
  ];

  return (
    <div className="min-h-full pt-14 lg:pt-0">
      <div className="px-4 sm:px-8 py-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground text-sm mt-1">Store and access all critical business documents.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} files</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                <FolderOpen className="w-4 h-4"/> Open Folder
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer">
          <FileText className="w-12 h-12 text-muted-foreground mb-4"/>
          <p className="font-semibold text-lg mb-1">Drop files here to upload</p>
          <p className="text-sm text-muted-foreground">Supports PDF, Word, Excel, images and more</p>
          <button className="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}
