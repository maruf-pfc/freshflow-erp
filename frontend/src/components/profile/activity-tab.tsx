"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { AuditLogItem } from "@/types/employee";

interface ActivityTabProps {
  activities: AuditLogItem[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const categories = ["ALL", "AUTH", "INVENTORY", "ORDERS", "PROFILE"];

  const filteredLogs = activities.filter((log) => {
    if (filterCategory === "ALL") return true;
    return log.category.toUpperCase() === filterCategory;
  });

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1b2b24]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Activity & Audit Log
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Append-only tamper-resistant record of system and operational
            events.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterCategory === cat
                  ? "bg-[#063c35] text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-[#16231d] dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="mt-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No events found for this filter category.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const dateStr = new Date(log.created_at).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3.5 rounded-lg border border-slate-100 dark:border-[#1b2b24] bg-slate-50/60 dark:bg-[#121c17]/60 hover:bg-slate-50 dark:hover:bg-[#141f1a] transition-colors"
              >
                <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.description}
                    </p>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>
                      Actor:{" "}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {log.actor_name}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      [{log.action}]
                    </span>
                    {log.ip_address && (
                      <>
                        <span>•</span>
                        <span className="font-mono">IP: {log.ip_address}</span>
                      </>
                    )}
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 p-2 rounded bg-white dark:bg-[#0c1210] border border-slate-200/60 dark:border-[#1b2b24]/60 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      {JSON.stringify(log.metadata, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
