import { api } from "@/lib/api";
import type {
  AdminEmployeeUpdatePayload,
  AuditLogItem,
  Department,
  EmployeePersonalUpdatePayload,
  EmployeeProfile,
  ReportingStructure,
} from "@/types/employee";

export const employeeApi = {
  /**
   * Fetch currently authenticated employee's full profile
   */
  async getMyProfile(): Promise<EmployeeProfile> {
    const response = await api.get<EmployeeProfile>("/employees/me/");
    return response.data;
  },

  /**
   * Update employee-editable personal information
   */
  async updateMyProfile(
    payload: EmployeePersonalUpdatePayload,
  ): Promise<EmployeeProfile> {
    const response = await api.patch<EmployeeProfile>(
      "/employees/me/",
      payload,
    );
    return response.data;
  },

  /**
   * Upload and set profile picture
   */
  async uploadProfilePicture(
    file: File,
  ): Promise<{ success: boolean; profile_picture_url: string }> {
    const formData = new FormData();
    formData.append("profile_picture", file);
    const response = await api.post<{
      success: boolean;
      profile_picture_url: string;
    }>("/employees/me/profile-picture/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Fetch current user's personal audit/activity log
   */
  async getMyActivity(): Promise<AuditLogItem[]> {
    const response = await api.get<
      { results?: AuditLogItem[] } | AuditLogItem[]
    >("/employees/me/activity/");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Fetch supervisor, self, and team hierarchy
   */
  async getMyReportingStructure(): Promise<ReportingStructure> {
    const response = await api.get<ReportingStructure>(
      "/employees/me/reporting-structure/",
    );
    return response.data;
  },

  /**
   * Fetch all active departments
   */
  async getDepartments(): Promise<Department[]> {
    const response = await api.get<{ results?: Department[] } | Department[]>(
      "/employees/departments/",
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Admin: update employee fields
   */
  async updateEmployee(
    id: number,
    payload: AdminEmployeeUpdatePayload,
  ): Promise<EmployeeProfile> {
    const response = await api.patch<EmployeeProfile>(
      `/employees/${id}/`,
      payload,
    );
    return response.data;
  },

  /**
   * Admin: activate employee
   */
  async activateEmployee(
    id: number,
  ): Promise<{ status: string; message: string }> {
    const response = await api.post<{ status: string; message: string }>(
      `/employees/${id}/activate/`,
    );
    return response.data;
  },

  /**
   * Admin: suspend employee
   */
  async suspendEmployee(
    id: number,
  ): Promise<{ status: string; message: string }> {
    const response = await api.post<{ status: string; message: string }>(
      `/employees/${id}/suspend/`,
    );
    return response.data;
  },

  /**
   * Admin: global audit trail
   */
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const response = await api.get<
      { results?: AuditLogItem[] } | AuditLogItem[]
    >("/employees/audit-logs/");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },
};
