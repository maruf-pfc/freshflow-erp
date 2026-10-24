"use client";

import {
  Building2,
  Calendar,
  Camera,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import type { EmployeeProfile } from "@/types/employee";

interface ProfileHeroCardProps {
  profile: EmployeeProfile;
  onUploadPictureClick: () => void;
}

export function ProfileHeroCard({
  profile,
  onUploadPictureClick,
}: ProfileHeroCardProps) {
  // Format joined date
  const joinedDateStr = profile.date_of_joining
    ? new Date(profile.date_of_joining).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "12 Jan 2024";

  // Derive initials
  const initials =
    profile.first_name && profile.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : profile.display_name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "MA";

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512] transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Avatar + Identity + Tags */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5 min-w-0">
          {/* Avatar with Camera Trigger */}
          <div className="relative shrink-0">
            {profile.profile_picture_url ? (
              <div className="relative size-22 rounded-full overflow-hidden ring-3 ring-emerald-600/20 shadow-md">
                <Image
                  src={profile.profile_picture_url}
                  alt={profile.display_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-22 rounded-full bg-[#063c35] text-white flex items-center justify-center text-2xl font-bold tracking-tight shadow-md ring-3 ring-emerald-600/20">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={onUploadPictureClick}
              className="absolute -bottom-1 -right-1 size-7.5 rounded-full bg-white dark:bg-[#16231d] border border-slate-200 dark:border-[#1b2b24] text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center justify-center shadow-xs transition-colors hover:scale-105"
              title="Upload profile picture"
              aria-label="Upload profile picture"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.display_name}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60">
                {profile.employment_status === "ACTIVE"
                  ? "Active"
                  : profile.employment_status}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {profile.designation}
            </p>

            <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Employee ID: {profile.employee_id}
            </p>

            {/* Contact meta row */}
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">
                  {profile.company_email || profile.email}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span>{profile.personal_phone || "+880 1712 345678"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span>{profile.work_location}</span>
              </span>
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
                {profile.role}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60">
                {profile.employment_type === "FULL_TIME"
                  ? "Full-Time"
                  : profile.employment_type}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#16231d] dark:text-slate-300 dark:border-[#1b2b24]">
                Dhaka
              </span>
            </div>
          </div>
        </div>

        {/* Right: 2x2 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 lg:max-w-md w-full">
          {/* Joined On */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-[#141f1a]/60 border border-slate-200/70 dark:border-[#1b2b24]">
            <div className="size-9 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Joined On
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-none">
                {joinedDateStr}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                10 months ago
              </p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-[#141f1a]/60 border border-slate-200/70 dark:border-[#1b2b24]">
            <div className="size-9 rounded-md bg-slate-200/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Department
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate leading-none">
                {profile.department?.name || "Warehouse & Logistics"}
              </p>
            </div>
          </div>

          {/* Reports To */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-[#141f1a]/60 border border-slate-200/70 dark:border-[#1b2b24]">
            <div className="size-9 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Reports To
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate leading-none">
                {profile.reporting_manager?.name || "Ahmed Rahman"}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {profile.reporting_manager?.designation ||
                  "Operations Director"}
              </p>
            </div>
          </div>

          {/* Employment Type */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-[#141f1a]/60 border border-slate-200/70 dark:border-[#1b2b24]">
            <div className="size-9 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Employment Type
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-none">
                Full-Time
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Permanent
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
