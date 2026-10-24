"use client";

import {
  Check,
  CheckSquare,
  Edit,
  Monitor,
  Package,
  ShieldCheck,
  Thermometer,
  User,
  Users,
  X as XIcon,
} from "lucide-react";
import Image from "next/image";
import type {
  AuditLogItem,
  EmployeeProfile,
  ReportingStructure,
} from "@/types/employee";

interface OverviewTabProps {
  profile: EmployeeProfile;
  reportingStructure: ReportingStructure | null;
  activities: AuditLogItem[];
  isSelf: boolean;
  isAdmin: boolean;
  onEditPersonal: () => void;
  onEditEmployment: () => void;
  onViewAllActivity: () => void;
}

export function OverviewTab({
  profile,
  reportingStructure,
  activities,
  isSelf,
  isAdmin,
  onEditPersonal,
  onEditEmployment,
  onViewAllActivity,
}: OverviewTabProps) {
  // Format Date of Birth
  const dobStr = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "15 Mar 1992";

  // Format Date of Joining
  const joinedStr = profile.date_of_joining
    ? new Date(profile.date_of_joining).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "12 Jan 2024";

  const moduleAccess = profile.module_access || {
    inventory_management: true,
    temperature_logs: true,
    order_processing: true,
    customer_management: false,
    financial_reports: false,
    wastage_write_offs: true,
    analytics_forecasting: true,
    user_management: false,
    system_settings: false,
  };

  const metrics = profile.metrics || {
    total_orders_processed: 428,
    stock_received: 156,
    temperature_checks: 1240,
    system_uptime: "99.8%",
  };

  const recentLogs = activities.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* ─── Metric Cards Row (4 Cards) ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Orders Processed */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white dark:border-[#1b2b24] dark:bg-[#0e1512] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Orders Processed
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {metrics.total_orders_processed.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <span>↑ 12%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                vs last month
              </span>
            </p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Card 2: Stock Received */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white dark:border-[#1b2b24] dark:bg-[#0e1512] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Stock Received
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {metrics.stock_received.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <span>↑ 8%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                vs last month
              </span>
            </p>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <Package size={20} />
          </div>
        </div>

        {/* Card 3: Temperature Checks */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white dark:border-[#1b2b24] dark:bg-[#0e1512] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Temperature Checks
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {metrics.temperature_checks.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <span>↑ 15%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                vs last month
              </span>
            </p>
          </div>
          <div className="size-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/40">
            <Thermometer size={20} />
          </div>
        </div>

        {/* Card 4: System Uptime */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white dark:border-[#1b2b24] dark:bg-[#0e1512] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              System Uptime
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {metrics.system_uptime}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <span>0.0%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                last 30 days
              </span>
            </p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* ─── Main 2-Column Split Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Personal Information & Employment Details (approx 7.5 / 12) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card: Personal Information */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1b2b24]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Personal Information
              </h3>
              <button
                type="button"
                onClick={onEditPersonal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md border border-slate-200 dark:border-[#1b2b24] hover:bg-slate-50 dark:hover:bg-[#141f1a] transition-colors"
              >
                <Edit size={12} />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-3.5 text-xs">
              {/* Col 1 */}
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Full Name
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {profile.display_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Username
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {profile.username}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Email Address
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.company_email || profile.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Phone Number
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.personal_phone || "+880 1712 345678"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Date of Birth
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {dobStr}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Gender
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.gender || "Male"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    National ID
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {profile.national_id || "19923657891234"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Address
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 leading-relaxed block">
                    {profile.address ||
                      "House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh"}
                  </span>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Emergency Contact Name
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {profile.emergency_contact_name || "Nusrat Jahan"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Emergency Contact Phone
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.emergency_contact_phone || "+880 1811 223344"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Blood Group
                  </span>
                  <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {profile.blood_group || "B+"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Marital Status
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.marital_status || "Married"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Nationality
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.nationality || "Bangladeshi"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Preferred Language
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.preferred_language || "English, Bangla"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Profile Photo
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-xs">
                    {profile.profile_picture
                      ? "custom photo uploaded"
                      : "avatar uploaded"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Account Status
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Last Login
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Monitor size={12} className="text-slate-400" />
                    <span>17 Dec 2024, 10:24 AM</span>
                    <span className="text-slate-400 dark:text-slate-500">
                      • Chrome on macOS
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Employment Details */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1b2b24]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Employment Details
              </h3>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onEditEmployment}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md border border-slate-200 dark:border-[#1b2b24] hover:bg-slate-50 dark:hover:bg-[#141f1a] transition-colors"
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 pt-3.5 text-xs">
              {/* Left Col */}
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Employee ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {profile.employee_id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Department
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {profile.department?.name || "Warehouse & Logistics"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Designation
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.designation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Reports To
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.reporting_manager?.name || "Ahmed Rahman"} (
                    {profile.reporting_manager?.designation ||
                      "Operations Director"}
                    )
                  </span>
                </div>
              </div>

              {/* Right Col */}
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Date of Joining
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {joinedStr}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Employment Type
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.employment_type === "FULL_TIME"
                      ? "Full-Time"
                      : profile.employment_type}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Work Location
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.work_location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Shift Schedule
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {profile.shift_schedule}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Salary Grade
                  </span>
                  <span className="font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
                    {profile.salary_grade}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Role & Access, Reporting Structure, Recent Activity (approx 4.5 / 12) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Role & Access */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b2b24]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Role & Access
              </h3>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onEditEmployment}
                  className="text-xs font-semibold text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200 dark:border-[#1b2b24] px-2 py-0.5 rounded-md"
                >
                  Edit Role
                </button>
              )}
            </div>

            {/* Role Header Card */}
            <div className="mt-3 p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-2.5">
              <div className="size-8 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Package size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  {profile.designation || "Warehouse Manager"}
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed mt-0.5">
                  Manages inventory, stock intake, temperature monitoring and
                  warehouse operations.
                </p>
              </div>
            </div>

            {/* Module Access Checklist */}
            <div className="mt-3.5">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Module Access
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs">
                {/* 1. Inventory Management */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.inventory_management ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.inventory_management
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600 line-through"
                    }
                  >
                    Inventory Management
                  </span>
                </div>

                {/* 2. Wastage & Write-offs */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.wastage_write_offs ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.wastage_write_offs
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600 line-through"
                    }
                  >
                    Wastage & Write-offs
                  </span>
                </div>

                {/* 3. Temperature Logs */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.temperature_logs ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.temperature_logs
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600 line-through"
                    }
                  >
                    Temperature Logs
                  </span>
                </div>

                {/* 4. Analytics & Forecasting */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.analytics_forecasting ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.analytics_forecasting
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600 line-through"
                    }
                  >
                    Analytics & Forecasting
                  </span>
                </div>

                {/* 5. Order Processing */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.order_processing ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.order_processing
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600 line-through"
                    }
                  >
                    Order Processing
                  </span>
                </div>

                {/* 6. User Management */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.user_management ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.user_management
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                    }
                  >
                    User Management
                  </span>
                </div>

                {/* 7. Customer Management */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.customer_management ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.customer_management
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                    }
                  >
                    Customer Management
                  </span>
                </div>

                {/* 8. System Settings */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.system_settings ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.system_settings
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                    }
                  >
                    System Settings
                  </span>
                </div>

                {/* 9. Financial Reports */}
                <div className="flex items-center gap-1.5">
                  {moduleAccess.financial_reports ? (
                    <Check
                      size={13}
                      className="text-emerald-600 font-bold shrink-0"
                    />
                  ) : (
                    <XIcon
                      size={13}
                      className="text-rose-500 font-bold shrink-0"
                    />
                  )}
                  <span
                    className={
                      moduleAccess.financial_reports
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                    }
                  >
                    Financial Reports
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Reporting Structure */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b2b24]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Reporting Structure
              </h3>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                View Org Chart
              </button>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {/* Supervisor */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-[#141f1a]/50 border border-slate-100 dark:border-[#1b2b24]">
                <div className="flex items-center gap-2.5">
                  {reportingStructure?.manager?.profile_picture_url ? (
                    <div className="relative size-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-[#1b2b24]">
                      <Image
                        src={reportingStructure.manager.profile_picture_url}
                        alt={reportingStructure.manager.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {reportingStructure?.manager?.name
                        ? reportingStructure.manager.name
                            .trim()
                            .split(/\s+/)
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "AR"}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {reportingStructure?.manager?.name || "Ahmed Rahman"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                      {reportingStructure?.manager?.designation ||
                        "Operations Director"}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80">
                  {reportingStructure?.manager?.badge || "Director"}
                </span>
              </div>

              {/* Self */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40">
                <div className="flex items-center gap-2.5">
                  {profile.profile_picture_url ||
                  reportingStructure?.employee?.profile_picture_url ? (
                    <div className="relative size-8 rounded-full overflow-hidden ring-1 ring-emerald-600/30 shrink-0">
                      <Image
                        src={
                          profile.profile_picture_url ||
                          reportingStructure?.employee?.profile_picture_url ||
                          ""
                        }
                        alt={profile.display_name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-8 rounded-full bg-[#063c35] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {profile.display_name
                        ? profile.display_name
                            .trim()
                            .split(/\s+/)
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "MA"}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {profile.display_name}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-none mt-0.5">
                      {profile.designation} {isSelf ? "(You)" : ""}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80">
                  Manager
                </span>
              </div>

              {/* Team Members */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-[#141f1a]/50 border border-slate-100 dark:border-[#1b2b24]">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {reportingStructure?.team?.name || "Warehouse Team"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                      {reportingStructure?.team?.count || 8} members
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
                  Team
                </span>
              </div>
            </div>
          </div>

          {/* 3. Recent Activity */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b2b24]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Recent Activity
              </h3>
              <button
                type="button"
                onClick={onViewAllActivity}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No recent activity recorded yet.
                </p>
              ) : (
                recentLogs.map((log) => {
                  let icon = <User size={12} className="text-emerald-600" />;
                  let bg = "bg-emerald-50 text-emerald-600";
                  let detail = "";

                  if (log.action.includes("TEMPERATURE")) {
                    icon = <Thermometer size={12} className="text-blue-600" />;
                    bg = "bg-blue-50 text-blue-600";
                    detail = "-18.2°C";
                  } else if (log.action.includes("STOCK")) {
                    icon = <Package size={12} className="text-blue-600" />;
                    bg = "bg-blue-50 text-blue-600";
                    detail = "120 kg";
                  } else if (log.action.includes("ORDER")) {
                    icon = <CheckSquare size={12} className="text-amber-600" />;
                    bg = "bg-amber-50 text-amber-600";
                    detail = "Pizza Hut";
                  } else if (log.action.includes("LOGIN")) {
                    detail = "Dhaka, BD";
                  }

                  // Relative time helper
                  const now = new Date();
                  const eventTime = new Date(log.created_at);
                  const diffMinutes = Math.floor(
                    (now.getTime() - eventTime.getTime()) / 60000,
                  );
                  let timeAgo = "Just now";
                  if (diffMinutes >= 1440) {
                    timeAgo = `${Math.floor(diffMinutes / 1440)} days ago`;
                  } else if (diffMinutes >= 60) {
                    timeAgo = `${Math.floor(diffMinutes / 60)} hours ago`;
                  } else if (diffMinutes > 1) {
                    timeAgo = `${diffMinutes} minutes ago`;
                  }

                  return (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bg}`}
                        >
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 font-medium truncate leading-tight">
                            {log.description}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                      {detail && (
                        <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 shrink-0">
                          {detail}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
