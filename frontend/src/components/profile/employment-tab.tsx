"use client";

import { Briefcase, Building2, Edit } from "lucide-react";
import type { EmployeeProfile } from "@/types/employee";

interface EmploymentTabProps {
  profile: EmployeeProfile;
  isAdmin: boolean;
  onEdit: () => void;
}

export function EmploymentTab({
  profile,
  isAdmin,
  onEdit,
}: EmploymentTabProps) {
  const joinedStr = profile.date_of_joining
    ? new Date(profile.date_of_joining).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "12 Jan 2024";

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1b2b24]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Official Employment & Organization Records
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Category A Administrator-controlled metadata. Changes require
            administrative authority.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#063c35] text-white hover:bg-[#084b42] text-xs font-semibold shadow-xs transition-colors"
          >
            <Edit size={13} />
            <span>Manage Employment</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 text-xs">
        {/* Placement & Organization */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 size={14} className="text-emerald-600" />
            <span>Organization & Hierarchy</span>
          </h4>

          <div className="space-y-3 pl-5 border-l-2 border-slate-100 dark:border-[#1b2b24]">
            <div>
              <span className="text-slate-400 block text-[11px]">
                Employee ID
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {profile.employee_id}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Department
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile.department?.name || "Warehouse & Logistics"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Official Designation
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.designation}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Assigned Role
              </span>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 mt-0.5">
                {profile.role}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Direct Reporting Manager
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.reporting_manager?.name || "Ahmed Rahman"} (
                {profile.reporting_manager?.designation ||
                  "Operations Director"}
                )
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Work Hub Location
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.work_location}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Compensation */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase size={14} className="text-blue-600" />
            <span>Contract & Compensation</span>
          </h4>

          <div className="space-y-3 pl-5 border-l-2 border-slate-100 dark:border-[#1b2b24]">
            <div>
              <span className="text-slate-400 block text-[11px]">
                Date of Joining
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {joinedStr}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Employment Type
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.employment_type === "FULL_TIME"
                  ? "Full-Time (Permanent)"
                  : profile.employment_type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Employment Status
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                {profile.employment_status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Shift Schedule
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {profile.shift_schedule}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Compensation Band
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {profile.salary_grade}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
