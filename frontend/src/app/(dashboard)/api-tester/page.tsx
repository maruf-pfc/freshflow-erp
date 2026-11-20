"use client";

import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Key,
  Layers,
  Play,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EndpointPreset {
  id: string;
  category:
    | "Auth"
    | "Inventory"
    | "CRM"
    | "Orders (FEFO)"
    | "Wastage"
    | "Analytics"
    | "Employees";
  name: string;
  method: "GET" | "POST" | "PATCH";
  url: string;
  description: string;
  defaultPayload?: string;
  expectedRole?: string;
}

const PRESETS: EndpointPreset[] = [
  // Analytics
  {
    id: "analytics-kpi",
    category: "Analytics",
    name: "Dashboard KPI Aggregations",
    method: "GET",
    url: "/analytics/kpis/",
    description:
      "Calculates live active cold batches, near-expiry count (≤2d), total revenue, and spoilage scrap loss.",
  },

  // Inventory
  {
    id: "inv-items",
    category: "Inventory",
    name: "List Perishable Item Catalog",
    method: "GET",
    url: "/inventory/items/",
    description:
      "Retrieves temperature-controlled master items, storage ranges, and shelf-life constraints.",
  },
  {
    id: "inv-batches",
    category: "Inventory",
    name: "List Stock Batches (FEFO Tracked)",
    method: "GET",
    url: "/inventory/batches/",
    description:
      "Returns all active cold batches ordered by expiry_date ASC with remaining_days and effective_price.",
  },
  {
    id: "inv-create-batch",
    category: "Inventory",
    name: "Receive New Stock Batch",
    method: "POST",
    url: "/inventory/batches/",
    expectedRole: "Warehouse Manager",
    description:
      "Staff-only: Intake a new perishable batch with lot number, initial quantity, and storage bin.",
    defaultPayload: JSON.stringify(
      {
        batch_number: `LOT-${Date.now().toString().slice(-6)}`,
        item: 1,
        harvest_pack_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(Date.now() + 86400000 * 14)
          .toISOString()
          .slice(0, 10),
        initial_quantity: "50.00",
        current_quantity: "50.00",
        purchase_cost: "220.00",
        base_selling_price: "310.00",
        status: "AVAILABLE",
        storage_bin: "FREEZER-A3",
      },
      null,
      2,
    ),
  },

  // CRM
  {
    id: "crm-restaurants",
    category: "CRM",
    name: "List Restaurant Clients & Tiers",
    method: "GET",
    url: "/crm/restaurants/",
    expectedRole: "Sales Agent",
    description:
      "Returns client restaurants, tier discount percentages (Bronze 0%, Silver 3%, Gold 7%, Platinum 10%), and credit limits.",
  },

  // Orders & FEFO
  {
    id: "orders-fefo-create",
    category: "Orders (FEFO)",
    name: "Submit Order (Atomic FEFO Allocation)",
    method: "POST",
    url: "/orders/",
    description:
      "Triggers strict First-Expired, First-Out batch deduction, row-level locking, and automated tier discount.",
    defaultPayload: JSON.stringify(
      {
        items: [
          {
            item_id: 1,
            quantity: "15.00",
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    id: "orders-list",
    category: "Orders (FEFO)",
    name: "List Orders & Allocated Batches",
    method: "GET",
    url: "/orders/",
    description:
      "Lists order history with breakdown of allocated batches, unit prices, and status.",
  },

  // Wastage
  {
    id: "waste-list",
    category: "Wastage",
    name: "List Spoilage & Wastage Logs",
    method: "GET",
    url: "/wastage/logs/",
    expectedRole: "Warehouse Manager",
    description:
      "Audit trail of discarded lots, root causes (temperature breach, shelf-life expiry), and financial loss tallies.",
  },

  // Employees
  {
    id: "emp-me",
    category: "Employees",
    name: "Current Employee Profile & Access",
    method: "GET",
    url: "/employees/me/",
    description:
      "Authenticated staff profile with employee ID, salary grade, department, and module access permissions.",
  },
  {
    id: "emp-activity",
    category: "Employees",
    name: "Employee Activity & Audit Trail",
    method: "GET",
    url: "/employees/me/activity/",
    description:
      "Immutable security audit log of user actions, timestamps, and IP addresses.",
  },
];

const DEMO_PERSONAS = [
  {
    role: "Admin",
    username: "admin_demo",
    pass: "Password123!",
    color:
      "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    role: "Warehouse Manager",
    username: "warehouse_demo",
    pass: "Password123!",
    color:
      "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    role: "Sales Agent",
    username: "sales_demo",
    pass: "Password123!",
    color:
      "border-teal-300 text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300",
  },
  {
    role: "Restaurant Client",
    username: "bistro_chef",
    pass: "StrongPassword123!",
    color:
      "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300",
  },
];

export default function ApiTesterPage() {
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(
    PRESETS[0],
  );
  const [method, setMethod] = useState<string>(PRESETS[0].method);
  const [endpointUrl, setEndpointUrl] = useState<string>(PRESETS[0].url);
  const [payloadText, setPayloadText] = useState<string>(
    PRESETS[0].defaultPayload || "",
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [_responseHeaders, setResponseHeaders] = useState<Record<
    string,
    string
  > | null>(null);
  const [responseData, setResponseData] = useState<unknown>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  // Sync preset changes
  const handleSelectPreset = (p: EndpointPreset) => {
    setSelectedPreset(p);
    setMethod(p.method);
    setEndpointUrl(p.url);
    setPayloadText(p.defaultPayload || "");
  };

  // Fast 1-click authentication switcher
  const handleAuthenticate = async (
    username: string,
    pass: string,
    roleName: string,
  ) => {
    setAuthStatusMessage(`Authenticating as ${roleName}...`);
    try {
      const res = await api.post("/auth/token/", { username, password: pass });
      const { access, refresh } = res.data;
      localStorage.setItem("freshflow_access_token", access);
      localStorage.setItem("freshflow_refresh_token", refresh);
      setActivePersona(roleName);
      setAuthStatusMessage(`Authenticated as ${roleName} (${username})`);
    } catch {
      setAuthStatusMessage(
        `Authentication failed for ${username}. Check backend credentials.`,
      );
    }
  };

  // Execute request
  const handleSendRequest = async () => {
    setIsExecuting(true);
    setResponseStatus(null);
    setResponseData(null);
    setResponseHeaders(null);
    const start = performance.now();

    try {
      let res: { status: number; data: unknown } | null = null;
      let parsedBody: unknown = null;
      if (payloadText && method !== "GET") {
        try {
          parsedBody = JSON.parse(payloadText);
        } catch {
          setResponseStatus(400);
          setResponseData({
            error: "Invalid JSON format in Request Body payload.",
          });
          setIsExecuting(false);
          return;
        }
      }

      if (method === "GET") {
        res = await api.get(endpointUrl);
      } else if (method === "POST") {
        res = await api.post(endpointUrl, parsedBody);
      } else if (method === "PATCH") {
        res = await api.patch(endpointUrl, parsedBody);
      }

      const elapsed = Math.round(performance.now() - start);
      setExecutionTimeMs(elapsed);
      if (res) {
        setResponseStatus(res.status);
        setResponseData(res.data);
      }
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setExecutionTimeMs(elapsed);
      const axiosErr = err as { response?: { status: number; data: unknown } };
      if (axiosErr.response) {
        setResponseStatus(axiosErr.response.status);
        setResponseData(axiosErr.response.data);
      } else {
        setResponseStatus(500);
        setResponseData({
          error:
            (err as Error).message || "Network Error / Backend Unreachable",
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseData) {
      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-[#1b2b24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Backend API Test Bench
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-[#086355] border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              Interactive Dev Tools
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pre-defense verification utility to exercise Django REST Framework
            endpoints, permissions, and FEFO allocation logic.
          </p>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Key size={12} />
            <span>Switch Role:</span>
          </div>
          {DEMO_PERSONAS.map((p) => (
            <button
              key={p.role}
              type="button"
              onClick={() => handleAuthenticate(p.username, p.pass, p.role)}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer",
                activePersona === p.role
                  ? p.color
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#0e1612] dark:border-[#1b2b24] dark:text-slate-300 dark:hover:bg-[#14261f]",
              )}
            >
              {p.role}
            </button>
          ))}
        </div>
      </div>

      {authStatusMessage && (
        <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-[#086355] dark:bg-[#0c241c] dark:border-[#1b3b2e] dark:text-[#34d399] flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{authStatusMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Preset Selector | Right Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Endpoint Catalog Presets */}
        <div className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
          <div className="text-xs font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#1b2b24] flex items-center gap-1.5">
            <Layers size={14} className="text-emerald-600" />
            <span>Preset Endpoint Scenarios</span>
          </div>

          <div className="space-y-1.5 mt-2.5 max-h-[640px] overflow-y-auto pr-1">
            {PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-md border text-xs transition-colors cursor-pointer block",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-[#12241d] dark:border-emerald-600"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 dark:border-[#15231c] dark:bg-[#0d1612] dark:hover:bg-[#13201a]",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0",
                        p.method === "GET"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                      )}
                    >
                      {p.method}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {p.url}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                    {p.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Request & Response Viewer */}
        <div className="lg:col-span-8 space-y-3">
          {/* Request Header Bar */}
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="text-xs font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#1b2b24]">
              {selectedPreset.name}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedPreset.description}
            </p>

            {/* URL & Method Input Group */}
            <div className="mt-3 flex items-center gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="h-9 px-2.5 rounded border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-800 dark:border-[#1b2b24] dark:bg-[#121c17] dark:text-slate-200"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PATCH">PATCH</option>
              </select>

              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none">
                  /api
                </span>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full h-9 pl-12 pr-3 rounded border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 dark:border-[#1b2b24] dark:bg-[#121c17] dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleSendRequest}
                disabled={isExecuting}
                className="h-9 px-4 rounded bg-[#086355] hover:bg-[#064e43] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isExecuting ? (
                  <>
                    <RotateCcw size={13} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Request Body Editor (for POST/PATCH) */}
            {method !== "GET" && (
              <div className="mt-3">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  Request Payload (JSON):
                </div>
                <textarea
                  rows={6}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 dark:border-[#1b2b24] dark:bg-[#070c0a] dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-[#1b2b24] dark:bg-[#0e1512]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b2b24]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Response Inspector
                </span>

                {responseStatus !== null && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-mono font-bold",
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
                    )}
                  >
                    HTTP {responseStatus}
                  </span>
                )}

                {executionTimeMs !== null && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{executionTimeMs} ms</span>
                  </span>
                )}
              </div>

              {responseData !== null && (
                <button
                  type="button"
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              )}
            </div>

            {/* Response Content */}
            <div className="mt-3">
              {responseData === null ? (
                <div className="py-12 text-center text-slate-400 text-xs font-mono">
                  Click &ldquo;Send Request&rdquo; to execute this API endpoint
                  and inspect the live JSON response.
                </div>
              ) : (
                <pre className="p-3 rounded-md bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800 select-text">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
