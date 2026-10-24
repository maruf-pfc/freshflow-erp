"use client";

import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  displayName: string;
  isSelf: boolean;
  onEditClick: () => void;
}

export function ProfileHeader({
  displayName,
  isSelf,
  onEditClick,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-[#1b2b24]">
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
          <Link
            href="/overview"
            className="flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Profile</span>
          </Link>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">
            {displayName}
          </span>
        </div>

        {/* Page Title & Subtitle */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isSelf ? "My Profile" : "Employee Profile"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal information, role details, and account settings.
        </p>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onEditClick}
        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#063c35] text-white hover:bg-[#084b42] text-xs font-semibold shadow-xs transition-colors shrink-0"
      >
        <Edit3 size={14} />
        <span>{isSelf ? "Edit Profile" : "Edit Employee"}</span>
      </button>
    </div>
  );
}
