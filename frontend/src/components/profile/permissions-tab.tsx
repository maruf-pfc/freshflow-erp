"use client";

import { Check, ShieldCheck, X as XIcon } from "lucide-react";
import type { EmployeeProfile } from "@/types/employee";

interface PermissionsTabProps {
  profile: EmployeeProfile;
}

export function PermissionsTab({ profile }: PermissionsTabProps) {
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

  const modules = [
    {
      key: "inventory_management",
      title: "Cold Chain Inventory Management",
      desc: "Stock batch intake, FEFO allocation, cold storage zone assignment, and shelf-life monitoring.",
      enabled: moduleAccess.inventory_management,
    },
    {
      key: "temperature_logs",
      title: "Cold Storage Telemetry & Temperature Logs",
      desc: "Record hourly sensor readings, inspect thermal breaches, and verify safe storage compliance.",
      enabled: moduleAccess.temperature_logs,
    },
    {
      key: "order_processing",
      title: "B2B Order Processing & Challan Issuance",
      desc: "Create and allocate restaurant orders with automated batch reservation.",
      enabled: moduleAccess.order_processing,
    },
    {
      key: "wastage_write_offs",
      title: "Wastage Spoilage Logs & Flash Sales",
      desc: "Record spoilage batches, approve financial write-offs, and trigger automated near-expiry markdowns.",
      enabled: moduleAccess.wastage_write_offs,
    },
    {
      key: "analytics_forecasting",
      title: "Demand Volatility & Spoilage Matrix",
      desc: "Predict stock depletion curves and calculate supplier quality scores.",
      enabled: moduleAccess.analytics_forecasting,
    },
    {
      key: "customer_management",
      title: "CRM & Restaurant Tier Management",
      desc: "Manage restaurant client profiles, tiers (Bronze/Silver/Gold/Platinum), and credit limits.",
      enabled: moduleAccess.customer_management,
    },
    {
      key: "financial_reports",
      title: "Financial Reports & Spoilage Cost Accounting",
      desc: "Access aggregated profit margins, write-off ledger accounts, and revenue reconciliation.",
      enabled: moduleAccess.financial_reports,
    },
    {
      key: "user_management",
      title: "Workforce & Employee Account Provisioning",
      desc: "Administrator authority to create accounts, assign roles, and audit security events.",
      enabled: moduleAccess.user_management,
    },
    {
      key: "system_settings",
      title: "Global System Configuration & API Credentials",
      desc: "Configure cold-storage thresholds, CORS, Turso/libSQL settings, and system backup routines.",
      enabled: moduleAccess.system_settings,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
      <div className="pb-4 border-b border-slate-100 dark:border-[#1b2b24]">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={18}
            className="text-emerald-600 dark:text-emerald-400"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Role & Effective Module Permissions
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Assigned Role:{" "}
          <strong className="text-emerald-700 dark:text-emerald-400">
            {profile.role}
          </strong>{" "}
          ({profile.designation}). Permissions are enforced strictly on the
          Django backend API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {modules.map((mod) => (
          <div
            key={mod.key}
            className={`p-4 rounded-xl border transition-colors ${
              mod.enabled
                ? "bg-white dark:bg-[#121c17] border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs"
                : "bg-slate-50/50 dark:bg-[#0e1512]/50 border-slate-200/60 dark:border-[#1b2b24] opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {mod.title}
              </h4>
              <span
                className={`size-5 rounded-full flex items-center justify-center shrink-0 ${
                  mod.enabled
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                }`}
              >
                {mod.enabled ? <Check size={12} /> : <XIcon size={12} />}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              {mod.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
