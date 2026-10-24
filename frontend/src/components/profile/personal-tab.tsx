"use client";

import { Edit, Heart, User } from "lucide-react";
import type { EmployeeProfile } from "@/types/employee";

interface PersonalTabProps {
  profile: EmployeeProfile;
  onEdit: () => void;
}

export function PersonalTab({ profile, onEdit }: PersonalTabProps) {
  const dobStr = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "15 Mar 1992";

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1b2b24]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Personal & Emergency Information
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Employee-controlled personal contacts, residential address, and
            emergency details.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#063c35] text-white hover:bg-[#084b42] text-xs font-semibold shadow-xs transition-colors"
        >
          <Edit size={13} />
          <span>Edit Personal Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 text-xs">
        {/* Identity & Contact Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <User size={14} className="text-emerald-600" />
            <span>Identity & Communication</span>
          </h4>

          <div className="space-y-3 pl-5 border-l-2 border-slate-100 dark:border-[#1b2b24]">
            <div>
              <span className="text-slate-400 block text-[11px]">
                Official Name
              </span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                {profile.display_name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Username</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                @{profile.username}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Company Managed Email
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {profile.company_email || profile.email}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Personal Email
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.personal_email || profile.company_email}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Personal Phone Number
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">
                {profile.personal_phone || "+880 1712 345678"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Date of Birth
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {dobStr}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Gender</span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.gender || "Male"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                National Identification No.
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {profile.national_id || "19923657891234"}
              </span>
            </div>
          </div>
        </div>

        {/* Residence & Emergency Contacts */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Heart size={14} className="text-rose-500" />
            <span>Emergency Contacts & Demographics</span>
          </h4>

          <div className="space-y-3 pl-5 border-l-2 border-slate-100 dark:border-[#1b2b24]">
            <div>
              <span className="text-slate-400 block text-[11px]">
                Primary Emergency Contact
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile.emergency_contact_name || "Nusrat Jahan"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Emergency Contact Phone
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {profile.emergency_contact_phone || "+880 1811 223344"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Blood Group
              </span>
              <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 mt-0.5">
                {profile.blood_group || "B+"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Marital Status
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.marital_status || "Married"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Nationality
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.nationality || "Bangladeshi"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Preferred Language
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.preferred_language || "English, Bangla"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Residential Address
              </span>
              <span className="text-slate-800 dark:text-slate-200 leading-relaxed block mt-0.5">
                {profile.address ||
                  "House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
