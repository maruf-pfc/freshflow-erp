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
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profileData, activitiesData, reportingData, deptData] =
        await Promise.all([
          employeeApi.getMyProfile(),
          employeeApi.getMyActivity(),
          employeeApi.getMyReportingStructure(),
          employeeApi.getDepartments().catch(() => []),
        ]);

      setProfile(profileData);
      setActivities(activitiesData);
      setReportingStructure(reportingData);
      setDepartments(deptData);
    } catch (err: unknown) {
      let message = "Unable to load employee profile from backend.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: { detail?: string } } })
          .response;
        if (resp?.data?.detail) {
          message = resp.data.detail;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  if (error || !profile) {
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
