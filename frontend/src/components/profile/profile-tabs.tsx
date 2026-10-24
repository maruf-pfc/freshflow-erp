"use client";

import {
  Briefcase,
  History,
  LayoutDashboard,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileTab =
  | "overview"
  | "personal"
  | "employment"
  | "permissions"
  | "activity";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const TABS: {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "personal", label: "Personal Information", icon: User },
  { id: "employment", label: "Employment Details", icon: Briefcase },
  { id: "permissions", label: "Role & Permissions", icon: ShieldCheck },
  { id: "activity", label: "Activity Log", icon: History },
];

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-slate-200/90 dark:border-[#1b2b24] overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px",
                isActive
                  ? "border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              <Icon
                size={15}
                className={cn(
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500",
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
