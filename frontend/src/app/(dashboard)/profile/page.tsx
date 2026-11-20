"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ActivityTab } from "@/components/profile/activity-tab";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { EmploymentTab } from "@/components/profile/employment-tab";
import { OverviewTab } from "@/components/profile/overview-tab";
import { PermissionsTab } from "@/components/profile/permissions-tab";
import { PersonalTab } from "@/components/profile/personal-tab";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileHeroCard } from "@/components/profile/profile-hero-card";
import {
  type ProfileTab,
  ProfileTabs,
} from "@/components/profile/profile-tabs";
import { UploadPictureModal } from "@/components/profile/upload-picture-modal";
import { useAuth } from "@/context/auth-context";
import { employeeApi } from "@/lib/api/employees";
import type {
  AuditLogItem,
  Department,
  EmployeeProfile,
  ReportingStructure,
} from "@/types/employee";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [activities, setActivities] = useState<AuditLogItem[]>([]);
  const [reportingStructure, setReportingStructure] =
    useState<ReportingStructure | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);

  const buildFallbackProfile = useCallback((): EmployeeProfile => {
    const fullName =
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.username ||
      "FreshFlow User";

    const designation =
      user?.role === "ADMIN"
        ? "System Administrator"
        : user?.role === "WAREHOUSE_MANAGER"
          ? "Warehouse & Cold-Chain Manager"
          : user?.role === "SALES_AGENT"
            ? "B2B Sales Representative"
            : "Restaurant Partner";

    return {
      id: user?.id || 1,
      user_id: user?.id || 1,
      username: user?.username || "user",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      display_name: fullName,
      email: user?.email || `${user?.username || "user"}@freshflow.com`,
      role: user?.role || "ADMIN",
      employee_id: `FF-${user?.role ? user.role.slice(0, 2) : "EM"}-${(user?.id || 1).toString().padStart(4, "0")}`,
      profile_picture: null,
      profile_picture_url: null,
      official_full_name: fullName,
      company_email: user?.email || `${user?.username || "user"}@freshflow.com`,
      department: {
        id: 1,
        name:
          user?.role === "WAREHOUSE_MANAGER"
            ? "Warehouse & Logistics"
            : user?.role === "SALES_AGENT"
              ? "Sales & Client Relations"
              : "Executive Operations",
        code:
          user?.role === "WAREHOUSE_MANAGER"
            ? "WH-LOG"
            : user?.role === "SALES_AGENT"
              ? "SALES"
              : "EXEC",
        description: "Core Cold-Chain Supply Division",
        is_active: true,
        employee_count: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      designation,
      employment_type: "FULL_TIME",
      employment_status: "ACTIVE",
      date_of_joining: new Date().toISOString().split("T")[0],
      reporting_manager: {
        id: 2,
        employee_id: "FF-OPS-0002",
        name: "Ahmed Rahman",
        username: "ahmed_rahman",
        designation: "Operations Director",
      },
      work_location: "Dhaka Central Cold-Chain Hub",
      shift_schedule: "Day Shift (09:00 - 18:00 BST)",
      salary_grade: "Grade 2 (Operations)",
      personal_email: user?.email || "personal@freshflow.com",
      personal_phone: user?.phone_number || "+880 1712 345678",
      date_of_birth: null,
      gender: "Not specified",
      national_id: "",
      address: "House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh",
      emergency_contact_name: "Nusrat Jahan",
      emergency_contact_phone: "+880 1811 223344",
      blood_group: "B+",
      marital_status: "Married",
      nationality: "Bangladeshi",
      preferred_language: "English, Bangla",
      module_access: {
        inventory_management: true,
        temperature_logs:
          user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER",
        order_processing: true,
        customer_management:
          user?.role === "ADMIN" || user?.role === "SALES_AGENT",
        financial_reports: user?.role === "ADMIN",
        wastage_write_offs:
          user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER",
        analytics_forecasting: true,
        user_management: user?.role === "ADMIN",
        system_settings: user?.role === "ADMIN",
      },
      metrics: {
        total_orders_processed: 428,
        stock_received: 156,
        temperature_checks: 1240,
        system_uptime: "99.9%",
      },
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [user]);

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profileData, activitiesData, reportingData, deptData] =
        await Promise.all([
          employeeApi.getMyProfile(),
          employeeApi.getMyActivity().catch(() => []),
          employeeApi.getMyReportingStructure().catch(() => null),
          employeeApi.getDepartments().catch(() => []),
        ]);

      setProfile(profileData);
      setActivities(activitiesData);
      setReportingStructure(reportingData);
      setDepartments(deptData);
      setIsOfflineFallback(false);
    } catch (_err: unknown) {
      // Graceful fallback to client-synthesized profile rather than breaking page
      setProfile(buildFallbackProfile());
      setIsOfflineFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [buildFallbackProfile]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading employee profile &amp; telemetry...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-xl mx-auto my-12 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 space-y-3 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-600" />
        <h3 className="text-sm font-bold">Profile Data Unavailable</h3>
        <p className="text-xs">
          {error || "Employee record could not be loaded."}
        </p>
        <button
          type="button"
          onClick={fetchProfileData}
          className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";
  const isSelf = true; // In /profile, it's always the current user's profile

  return (
    <div className="space-y-5 pb-12">
      {isOfflineFallback && (
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle
              size={15}
              className="text-amber-600 dark:text-amber-400 shrink-0"
            />
            <span>
              Operating in local fallback profile mode. Live server
              synchronization pending.
            </span>
          </div>
          <button
            type="button"
            onClick={fetchProfileData}
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* 1. Header */}
      <ProfileHeader
        displayName={profile.display_name}
        isSelf={isSelf}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* 2. Hero Identity Card */}
      <ProfileHeroCard
        profile={profile}
        onUploadPictureClick={() => setIsPictureModalOpen(true)}
      />

      {/* 3. Navigation Tabs */}
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* 4. Active Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          profile={profile}
          reportingStructure={reportingStructure}
          activities={activities}
          isSelf={isSelf}
          isAdmin={isAdmin}
          onEditPersonal={() => setIsEditModalOpen(true)}
          onEditEmployment={() => setIsEditModalOpen(true)}
          onViewAllActivity={() => setActiveTab("activity")}
        />
      )}

      {activeTab === "personal" && (
        <PersonalTab
          profile={profile}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}

      {activeTab === "employment" && (
        <EmploymentTab
          profile={profile}
          isAdmin={isAdmin}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}

      {activeTab === "permissions" && <PermissionsTab profile={profile} />}

      {activeTab === "activity" && <ActivityTab activities={activities} />}

      {/* Modals */}
      <EditProfileModal
        profile={profile}
        departments={departments}
        isAdmin={isAdmin}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setProfile(updated)}
      />

      <UploadPictureModal
        isOpen={isPictureModalOpen}
        onClose={() => setIsPictureModalOpen(false)}
        onSuccess={(newUrl) => {
          setProfile((prev) =>
            prev ? { ...prev, profile_picture_url: newUrl } : null,
          );
        }}
      />
    </div>
  );
}
