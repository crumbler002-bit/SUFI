"use client";

import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  topbarRight?: React.ReactNode;
  alertStrip?: React.ReactNode;
}

export function Layout({ children, title, subtitle, topbarRight, alertStrip }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#07060C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} right={topbarRight} alertStrip={alertStrip} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
