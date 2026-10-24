import type { UserRole } from "./index";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "PROBATION"
  | "INTERN";

export type EmploymentStatus =
  | "ACTIVE"
  | "ON_LEAVE"
  | "SUSPENDED"
  | "TERMINATED";

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportingManagerSummary {
  id: number;
  employee_id: string;
  name: string;
  username: string;
  designation: string;
}

export interface ModuleAccess {
  inventory_management: boolean;
  temperature_logs: boolean;
  order_processing: boolean;
  customer_management: boolean;
  financial_reports: boolean;
  wastage_write_offs: boolean;
  analytics_forecasting: boolean;
  user_management: boolean;
  system_settings: boolean;
}

export interface EmployeeMetrics {
  total_orders_processed: number;
  stock_received: number;
  temperature_checks: number;
  system_uptime: string;
}

export interface EmployeeProfile {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  role: UserRole;
  employee_id: string;
  profile_picture: string | null;
  profile_picture_url: string | null;
  official_full_name: string;
  company_email: string;
  department: Department | null;
  designation: string;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  date_of_joining: string | null;
  reporting_manager: ReportingManagerSummary | null;
  work_location: string;
  shift_schedule: string;
  salary_grade: string;

  // Personal Fields
  personal_email: string | null;
  personal_phone: string | null;
  date_of_birth: string | null;
  gender: string;
  national_id: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_group: string;
  marital_status: string;
  nationality: string;
  preferred_language: string;

  // Metadata & Computed
  last_login: string | null;
  created_at: string;
  updated_at: string;
  module_access: ModuleAccess;
  metrics: EmployeeMetrics;
}

export interface AuditLogItem {
  id: number;
  actor_username: string;
  actor_name: string;
  target_username: string | null;
  action: string;
  category: string;
  description: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export interface ReportingStructure {
  manager: {
    id: number | null;
    name: string;
    designation: string;
    employee_id: string;
    badge: string;
    profile_picture_url?: string | null;
  } | null;
  employee: {
    id: number;
    name: string;
    designation: string;
    employee_id: string;
    badge: string;
    profile_picture_url?: string | null;
  };
  team: {
    name: string;
    count: number;
    badge: string;
  };
}

export interface EmployeePersonalUpdatePayload {
  first_name?: string;
  last_name?: string;
  personal_email?: string;
  personal_phone?: string;
  date_of_birth?: string;
  gender?: string;
  national_id?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: string;
  marital_status?: string;
  nationality?: string;
  preferred_language?: string;
}

export interface AdminEmployeeUpdatePayload
  extends EmployeePersonalUpdatePayload {
  role?: UserRole;
  official_full_name?: string;
  department?: number;
  designation?: string;
  employment_type?: EmploymentType;
  employment_status?: EmploymentStatus;
  date_of_joining?: string;
  reporting_manager?: number;
  work_location?: string;
  shift_schedule?: string;
  salary_grade?: string;
}
