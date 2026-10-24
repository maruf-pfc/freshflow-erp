from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class EmploymentType(models.TextChoices):
    FULL_TIME = "FULL_TIME", "Full-Time"
    PART_TIME = "PART_TIME", "Part-Time"
    CONTRACT = "CONTRACT", "Contract"
    PROBATION = "PROBATION", "Probation"
    INTERN = "INTERN", "Intern"


class EmploymentStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    ON_LEAVE = "ON_LEAVE", "On Leave"
    SUSPENDED = "SUSPENDED", "Suspended"
    TERMINATED = "TERMINATED", "Terminated"


class EmployeeProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
    )
    employee_id = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text="Unique company-assigned identifier, e.g. FF-WH-0024",
    )
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )

    # ─── Category A: Administrator-Controlled Employment Information ────────────
    official_full_name = models.CharField(max_length=150, blank=True)
    company_email = models.EmailField(blank=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    designation = models.CharField(
        max_length=100,
        default="Staff",
        help_text="Official job title, e.g. Warehouse Manager",
    )
    employment_type = models.CharField(
        max_length=30,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME,
    )
    employment_status = models.CharField(
        max_length=30,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
        db_index=True,
    )
    date_of_joining = models.DateField(null=True, blank=True)
    reporting_manager = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="direct_reports",
    )
    work_location = models.CharField(
        max_length=150,
        default="Dhaka Warehouse (Main)",
    )
    shift_schedule = models.CharField(
        max_length=100,
        default="Day Shift (9:00 AM – 6:00 PM)",
    )
    salary_grade = models.CharField(
        max_length=50,
        default="Grade 2 (Operations)",
        help_text="Confidential HR compensation band. Restricted visibility.",
    )

    # ─── Category B: Employee-Editable Personal Information ──────────────────────
    personal_email = models.EmailField(blank=True, null=True)
    personal_phone = models.CharField(max_length=30, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default="Male")
    national_id = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=30, blank=True)
    blood_group = models.CharField(max_length=10, blank=True, default="B+")
    marital_status = models.CharField(max_length=20, blank=True, default="Married")
    nationality = models.CharField(max_length=50, blank=True, default="Bangladeshi")
    preferred_language = models.CharField(
        max_length=100,
        blank=True,
        default="English, Bangla",
    )

    # ─── Category C: System-Generated / Audit Metadata ──────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_employees",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        name = self.official_full_name or self.user.get_full_name() or self.user.username
        return f"{name} ({self.employee_id}) - {self.designation}"


class AuditLog(models.Model):
    """
    Append-only tamper-resistant audit trail.
    No update or delete endpoints exposed in API or admin.
    """
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="performed_audit_logs",
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="target_audit_logs",
    )
    action = models.CharField(max_length=100, db_index=True)
    category = models.CharField(
        max_length=50,
        db_index=True,
        help_text="e.g. AUTH, PROFILE, EMPLOYMENT, INVENTORY, ORDERS, SECURITY",
    )
    description = models.TextField()
    resource_type = models.CharField(max_length=50, blank=True)
    resource_id = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        actor_name = self.actor.username if self.actor else "System"
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {actor_name} -> {self.action}: {self.description[:40]}"


class EmploymentHistory(models.Model):
    """
    Tracks official employment lifecycle changes (department, designation, salary grade, status).
    """
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name="employment_history",
    )
    field_name = models.CharField(max_length=50)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee.employee_id} {self.field_name}: '{self.old_value}' -> '{self.new_value}'"
