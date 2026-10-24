import io
from PIL import Image as PilImage
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import UserRole
from apps.employees.models import (
    AuditLog,
    Department,
    EmployeeProfile,
    EmploymentStatus,
    EmploymentType,
)

User = get_user_model()


class EmployeeProfileSecurityAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create department
        self.department = Department.objects.create(
            name="Warehouse & Logistics",
            code="WH-LOG",
            description="Warehouse department",
        )

        # Create admin user
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@freshflow.com",
            password="AdminPassword123!",
            role=UserRole.ADMIN,
            first_name="Admin",
            last_name="Super",
        )
        self.admin_profile = EmployeeProfile.objects.create(
            user=self.admin_user,
            employee_id="FF-AD-0001",
            official_full_name="Admin Super",
            company_email="admin@freshflow.com",
            department=self.department,
            designation="System Administrator",
            salary_grade="Grade 1 (Executive)",
        )

        # Create regular employee (Warehouse Manager)
        self.employee_user = User.objects.create_user(
            username="wh_manager",
            email="m.ahsan@freshflow.com",
            password="Password123!",
            role=UserRole.WAREHOUSE_MANAGER,
            first_name="Mohammad",
            last_name="Ahsan",
        )
        self.employee_profile = EmployeeProfile.objects.create(
            user=self.employee_user,
            employee_id="FF-WH-0024",
            official_full_name="Mohammad Ahsan",
            company_email="m.ahsan@freshflow.com",
            department=self.department,
            designation="Warehouse Manager",
            reporting_manager=self.admin_profile,
            salary_grade="Grade 2 (Operations)",
            personal_phone="+880 1712 345678",
            address="House 12, Road 4, Dhanmondi, Dhaka",
        )

    def test_unauthenticated_requests_denied(self):
        """Unauthenticated requests must receive 401 Unauthorized."""
        response = self.client.get("/api/employees/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get("/api/employees/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_employee_can_read_own_profile(self):
        """Employee can read their own profile with metrics and module access."""
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get("/api/employees/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["employee_id"], "FF-WH-0024")
        self.assertEqual(data["display_name"], "Mohammad Ahsan")
        self.assertIn("module_access", data)
        self.assertTrue(data["module_access"]["inventory_management"])
        self.assertFalse(data["module_access"]["user_management"])

    def test_employee_cannot_create_employee_accounts(self):
        """Regular employees are prohibited from provisioning accounts (403 Forbidden)."""
        self.client.force_authenticate(user=self.employee_user)
        payload = {
            "username": "new_hire",
            "email": "hire@freshflow.com",
            "password": "Password123!",
            "role": UserRole.WAREHOUSE_MANAGER,
            "employee_id": "FF-WH-9999",
            "designation": "Forklift Driver",
        }
        response = self.client.post("/api/employees/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_provision_new_employee_atomically(self):
        """Authorized administrator can provision an employee account and profile."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            "username": "new_hire",
            "email": "hire@freshflow.com",
            "password": "Password123!",
            "first_name": "Rahim",
            "last_name": "Uddin",
            "role": UserRole.WAREHOUSE_MANAGER,
            "employee_id": "FF-WH-0099",
            "department_id": self.department.id,
            "designation": "Junior Inventory Clerk",
            "work_location": "Chittagong Cold Hub",
        }
        response = self.client.post("/api/employees/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="new_hire").exists())
        self.assertTrue(EmployeeProfile.objects.filter(employee_id="FF-WH-0099").exists())

        # Verify audit log was recorded
        audit = AuditLog.objects.filter(action="EMPLOYEE_CREATED", resource_id=response.json()["id"]).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.actor, self.admin_user)

    def test_employee_cannot_modify_admin_controlled_fields(self):
        """Attempts by an employee to elevate role or alter employment status are rejected."""
        self.client.force_authenticate(user=self.employee_user)
        malicious_payload = {
            "role": UserRole.ADMIN,
            "salary_grade": "Grade 1 (Executive)",
            "designation": "Chief Technology Officer",
            "employee_id": "FF-AD-0000",
        }
        response = self.client.patch("/api/employees/me/", malicious_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Ensure role did not change
        self.employee_user.refresh_from_db()
        self.assertEqual(self.employee_user.role, UserRole.WAREHOUSE_MANAGER)

    def test_employee_can_update_permitted_personal_fields(self):
        """Employee can update their personal phone, address, and emergency contact."""
        self.client.force_authenticate(user=self.employee_user)
        payload = {
            "personal_phone": "+880 1899 999999",
            "address": "Banani DOHS, Dhaka 1213",
            "emergency_contact_name": "Fatima Ahsan",
            "emergency_contact_phone": "+880 1888 888888",
            "preferred_language": "English, Bangla",
        }
        response = self.client.patch("/api/employees/me/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.employee_profile.refresh_from_db()
        self.assertEqual(self.employee_profile.personal_phone, "+880 1899 999999")
        self.assertEqual(self.employee_profile.address, "Banani DOHS, Dhaka 1213")

        # Verify audit log
        audit = AuditLog.objects.filter(action="PROFILE_UPDATED", actor=self.employee_user).first()
        self.assertIsNotNone(audit)

    def test_profile_picture_upload_validation(self):
        """Profile picture upload validates file type and updates profile."""
        self.client.force_authenticate(user=self.employee_user)

        # 1. Invalid file content
        bad_file = SimpleUploadedFile("fake.jpg", b"NOT AN IMAGE", content_type="image/jpeg")
        response = self.client.post("/api/employees/me/profile-picture/", {"profile_picture": bad_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Valid image content
        image_io = io.BytesIO()
        image = PilImage.new("RGB", (100, 100), color="green")
        image.save(image_io, format="JPEG")
        image_io.seek(0)
        valid_file = SimpleUploadedFile("avatar.jpg", image_io.read(), content_type="image/jpeg")

        response = self.client.post("/api/employees/me/profile-picture/", {"profile_picture": valid_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employee_profile.refresh_from_db()
        self.assertTrue(bool(self.employee_profile.profile_picture))

    def test_reporting_structure_endpoint(self):
        """Reporting structure returns supervisor, self, and team."""
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get("/api/employees/me/reporting-structure/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("manager", data)
        self.assertIn("employee", data)
        self.assertIn("team", data)
        self.assertEqual(data["employee"]["employee_id"], "FF-WH-0024")

    def test_audit_logs_read_only_and_restricted(self):
        """Audit logs cannot be deleted or manipulated through the API."""
        self.client.force_authenticate(user=self.employee_user)
        # Regular employee cannot view global audit log
        response = self.client.get("/api/employees/audit-logs/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can view global audit log
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/employees/audit-logs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
