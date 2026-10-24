"use client";

import { AlertCircle, Loader2, X } from "lucide-react";
import { useState } from "react";
import { employeeApi } from "@/lib/api/employees";
import type { Department, EmployeeProfile } from "@/types/employee";

interface EditProfileModalProps {
  profile: EmployeeProfile;
  departments: Department[];
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: EmployeeProfile) => void;
}

export function EditProfileModal({
  profile,
  departments,
  isAdmin,
  isOpen,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    personal_email: profile.personal_email || profile.email || "",
    personal_phone: profile.personal_phone || "",
    address: profile.address || "",
    emergency_contact_name: profile.emergency_contact_name || "",
    emergency_contact_phone: profile.emergency_contact_phone || "",
    blood_group: profile.blood_group || "B+",
    marital_status: profile.marital_status || "Married",
    nationality: profile.nationality || "Bangladeshi",
    preferred_language: profile.preferred_language || "English, Bangla",
    // Admin editable fields
    designation: profile.designation || "",
    work_location: profile.work_location || "",
    shift_schedule: profile.shift_schedule || "",
    salary_grade: profile.salary_grade || "",
    department: profile.department?.id || undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let updated: EmployeeProfile;
      if (isAdmin) {
        updated = await employeeApi.updateEmployee(profile.id, formData);
      } else {
        // Strip any admin fields for safety
        const {
          designation,
          work_location,
          shift_schedule,
          salary_grade,
          department,
          ...personalOnly
        } = formData;
        updated = await employeeApi.updateMyProfile(personalOnly);
      }
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      let msg = "Failed to update profile. Please check your input.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { data?: Record<string, unknown> } })
          .response;
        if (resp?.data) {
          const firstErr = Object.values(resp.data)[0];
          if (typeof firstErr === "string") msg = firstErr;
          else if (Array.isArray(firstErr) && typeof firstErr[0] === "string")
            msg = firstErr[0];
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1b2b24] dark:bg-[#0e1512]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1b2b24]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAdmin ? "Manage Employee Profile" : "Edit Personal Details"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAdmin
                ? "Update official employment and authorized personal information."
                : "Update your personal contacts and emergency details."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="edit_first_name"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                First Name
              </label>
              <input
                id="edit_first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="edit_last_name"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Last Name
              </label>
              <input
                id="edit_last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="edit_phone"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Personal Phone Number
              </label>
              <input
                id="edit_phone"
                type="text"
                value={formData.personal_phone}
                onChange={(e) =>
                  setFormData({ ...formData, personal_phone: e.target.value })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="edit_email"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Personal Email
              </label>
              <input
                id="edit_email"
                type="email"
                value={formData.personal_email}
                onChange={(e) =>
                  setFormData({ ...formData, personal_email: e.target.value })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="edit_em_name"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Emergency Contact Name
              </label>
              <input
                id="edit_em_name"
                type="text"
                value={formData.emergency_contact_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency_contact_name: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="edit_em_phone"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Emergency Contact Phone
              </label>
              <input
                id="edit_em_phone"
                type="text"
                value={formData.emergency_contact_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergency_contact_phone: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit_address"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Residential Address
            </label>
            <textarea
              id="edit_address"
              rows={2}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full p-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label
                htmlFor="edit_blood"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Blood Group
              </label>
              <input
                id="edit_blood"
                type="text"
                value={formData.blood_group}
                onChange={(e) =>
                  setFormData({ ...formData, blood_group: e.target.value })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="edit_marital"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Marital Status
              </label>
              <input
                id="edit_marital"
                type="text"
                value={formData.marital_status}
                onChange={(e) =>
                  setFormData({ ...formData, marital_status: e.target.value })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="edit_lang"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Preferred Language
              </label>
              <input
                id="edit_lang"
                type="text"
                value={formData.preferred_language}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferred_language: e.target.value,
                  })
                }
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
              />
            </div>
          </div>

          {/* Administrator-Only Fields */}
          {isAdmin && (
            <div className="pt-3 border-t border-slate-100 dark:border-[#1b2b24] space-y-3">
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Administrator-Controlled Employment Settings
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="edit_designation"
                    className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                  >
                    Designation / Title
                  </label>
                  <input
                    id="edit_designation"
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit_dept"
                    className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                  >
                    Department
                  </label>
                  <select
                    id="edit_dept"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: Number(e.target.value) || undefined,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="edit_location"
                    className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                  >
                    Work Location
                  </label>
                  <input
                    id="edit_location"
                    type="text"
                    value={formData.work_location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        work_location: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit_shift"
                    className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                  >
                    Shift Schedule
                  </label>
                  <input
                    id="edit_shift"
                    type="text"
                    value={formData.shift_schedule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shift_schedule: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit_salary"
                  className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                >
                  Salary Band / Grade
                </label>
                <input
                  id="edit_salary"
                  type="text"
                  value={formData.salary_grade}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_grade: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#1b2b24] bg-white dark:bg-[#141f1a] text-xs"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-[#1b2b24]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1b2b24] text-slate-600 dark:text-slate-400 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#063c35] text-white hover:bg-[#084b42] text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isLoading && <Loader2 size={13} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
