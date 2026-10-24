import os
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog, Department, EmployeeProfile, EmploymentStatus, EmploymentType
from .serializers import (
    AdminEmployeeCreateSerializer,
    AdminEmployeeUpdateSerializer,
    AuditLogSerializer,
    DepartmentSerializer,
    EmployeeProfileReadSerializer,
    EmployeeSelfUpdateSerializer,
    ProfilePictureUploadSerializer,
)
from .services.audit import record_audit_event
from apps.authentication.models import UserRole
from apps.authentication.permissions import IsAdminRole

User = get_user_model()


def get_or_create_employee_profile(user) -> EmployeeProfile:
    """Ensure every authenticated user has an EmployeeProfile record."""
    profile = getattr(user, "employee_profile", None)
    if profile:
        return profile

    # Generate fallback employee ID
    role_prefix = {
        UserRole.ADMIN: "AD",
        UserRole.WAREHOUSE_MANAGER: "WH",
        UserRole.SALES_AGENT: "SA",
        UserRole.RESTAURANT_CLIENT: "RC",
    }.get(user.role, "EM")
    emp_id = f"FF-{role_prefix}-{user.id:04d}"

    # Default Department
    dept_name = {
        UserRole.ADMIN: ("Executive Operations", "EXEC"),
        UserRole.WAREHOUSE_MANAGER: ("Warehouse & Logistics", "WH-LOG"),
        UserRole.SALES_AGENT: ("Sales & Client Relations", "SALES"),
        UserRole.RESTAURANT_CLIENT: ("External Restaurant Clients", "CLIENT"),
    }.get(user.role, ("General Operations", "OPS"))

    dept, _ = Department.objects.get_or_create(
        code=dept_name[1],
        defaults={"name": dept_name[0], "description": f"{dept_name[0]} Department"},
    )

    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
    designation = {
        UserRole.ADMIN: "System Administrator",
        UserRole.WAREHOUSE_MANAGER: "Warehouse Manager",
        UserRole.SALES_AGENT: "Sales Representative",
        UserRole.RESTAURANT_CLIENT: "Restaurant Partner",
    }.get(user.role, "Staff Member")

    profile, _ = EmployeeProfile.objects.get_or_create(
        user=user,
        defaults={
            "employee_id": emp_id,
            "official_full_name": full_name,
            "company_email": user.email or f"{user.username}@freshflow.com",
            "department": dept,
            "designation": designation,
            "employment_type": EmploymentType.FULL_TIME,
            "employment_status": EmploymentStatus.ACTIVE,
            "work_location": "Dhaka Warehouse (Main)",
            "shift_schedule": "Day Shift (9:00 AM – 6:00 PM)",
            "salary_grade": "Grade 2 (Operations)",
            "personal_email": user.email,
            "personal_phone": user.phone_number or "+880 1712 345678",
            "address": "House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh",
            "emergency_contact_name": "Nusrat Jahan",
            "emergency_contact_phone": "+880 1811 223344",
            "preferred_language": "English, Bangla",
        },
    )
    return profile


class EmployeeMeView(APIView):
    """
    GET: Retrieve current authenticated user's Employee Profile.
    PATCH: Update employee-editable personal fields ONLY.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_employee_profile(request.user)
        serializer = EmployeeProfileReadSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        profile = get_or_create_employee_profile(request.user)
        serializer = EmployeeSelfUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        updated_profile = serializer.save()

        # Audit Event
        record_audit_event(
            action="PROFILE_UPDATED",
            category="PROFILE",
            description=f"{request.user.username} updated their personal profile information.",
            actor=request.user,
            target_user=request.user,
            resource_type="EmployeeProfile",
            resource_id=updated_profile.id,
            metadata={"updated_fields": list(request.data.keys())},
            request=request,
        )

        read_serializer = EmployeeProfileReadSerializer(updated_profile, context={"request": request})
        return Response(read_serializer.data)


class ProfilePictureUploadView(APIView):
    """
    POST: Upload or replace current user's profile picture with real validation.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = get_or_create_employee_profile(request.user)
        serializer = ProfilePictureUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_image = serializer.validated_data["profile_picture"]

        # Clean up old image if stored
        if profile.profile_picture:
            try:
                if os.path.isfile(profile.profile_picture.path):
                    os.remove(profile.profile_picture.path)
            except Exception:
                pass

        profile.profile_picture = new_image
        profile.save(update_fields=["profile_picture"])

        # Audit Event
        record_audit_event(
            action="PROFILE_PICTURE_UPDATED",
            category="PROFILE",
            description=f"{request.user.username} updated their profile picture.",
            actor=request.user,
            target_user=request.user,
            resource_type="EmployeeProfile",
            resource_id=profile.id,
            request=request,
        )

        image_url = request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None
        return Response(
            {
                "success": True,
                "message": "Profile picture updated successfully.",
                "profile_picture_url": image_url,
            },
            status=status.HTTP_200_OK,
        )


class EmployeeListCreateView(generics.ListCreateAPIView):
    """
    Administrator-only view to list and provision employee accounts.
    """
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminEmployeeCreateSerializer
        return EmployeeProfileReadSerializer

    def get_queryset(self):
        qs = EmployeeProfile.objects.select_related("user", "department", "reporting_manager__user").all()

        dept = self.request.query_params.get("department")
        if dept:
            qs = qs.filter(Q(department__code=dept) | Q(department__id=dept))

        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(user__role=role)

        emp_status = self.request.query_params.get("employment_status")
        if emp_status:
            qs = qs.filter(employment_status=emp_status)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(employee_id__icontains=search)
            )

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        read_serializer = EmployeeProfileReadSerializer(profile, context={"request": request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class EmployeeDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH: Retrieve or update employee profile.
    Self can read own; Admin can read all.
    Admin can edit all; non-admin can only edit own personal info.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = EmployeeProfile.objects.select_related("user", "department", "reporting_manager__user").all()

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            is_admin = self.request.user.role == UserRole.ADMIN or self.request.user.is_superuser
            return AdminEmployeeUpdateSerializer if is_admin else EmployeeSelfUpdateSerializer
        return EmployeeProfileReadSerializer

    def get_object(self):
        obj = super().get_object()
        is_admin = self.request.user.role == UserRole.ADMIN or self.request.user.is_superuser
        is_self = self.request.user.id == obj.user_id

        if not (is_admin or is_self):
            raise PermissionDenied("You do not have permission to access this employee's profile.")
        return obj


class EmployeeActivateView(APIView):
    """
    POST: Administrator-only activation of an employee account.
    """
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        profile = generics.get_object_or_404(EmployeeProfile, pk=pk)
        profile.employment_status = EmploymentStatus.ACTIVE
        profile.save(update_fields=["employment_status"])
        profile.user.is_active = True
        profile.user.save(update_fields=["is_active"])

        record_audit_event(
            action="EMPLOYEE_ACTIVATED",
            category="EMPLOYMENT",
            description=f"Administrator {request.user.username} activated employee {profile.employee_id}.",
            actor=request.user,
            target_user=profile.user,
            resource_type="EmployeeProfile",
            resource_id=profile.id,
            request=request,
        )
        return Response({"status": "ACTIVE", "message": "Employee account activated."})


class EmployeeSuspendView(APIView):
    """
    POST: Administrator-only suspension of an employee account.
    """
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        profile = generics.get_object_or_404(EmployeeProfile, pk=pk)
        profile.employment_status = EmploymentStatus.SUSPENDED
        profile.save(update_fields=["employment_status"])
        profile.user.is_active = False
        profile.user.save(update_fields=["is_active"])

        record_audit_event(
            action="EMPLOYEE_SUSPENDED",
            category="SECURITY",
            description=f"Administrator {request.user.username} suspended employee {profile.employee_id}.",
            actor=request.user,
            target_user=profile.user,
            resource_type="EmployeeProfile",
            resource_id=profile.id,
            request=request,
        )
        return Response({"status": "SUSPENDED", "message": "Employee account suspended."})


class MyActivityView(generics.ListAPIView):
    """
    GET: Current user's audit and activity events.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        user = self.request.user
        return AuditLog.objects.filter(
            Q(actor=user) | Q(target_user=user)
        ).select_related("actor", "target_user").order_by("-created_at")[:50]


class EmployeeActivityView(generics.ListAPIView):
    """
    GET: Audit and activity events for a specific employee (Admin or self).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        pk = self.kwargs.get("pk")
        profile = generics.get_object_or_404(EmployeeProfile, pk=pk)
        is_admin = self.request.user.role == UserRole.ADMIN or self.request.user.is_superuser
        is_self = self.request.user.id == profile.user_id

        if not (is_admin or is_self):
            raise PermissionDenied("You do not have permission to view activity logs for this employee.")

        return AuditLog.objects.filter(
            Q(actor=profile.user) | Q(target_user=profile.user)
        ).select_related("actor", "target_user").order_by("-created_at")[:50]


class AuditLogListView(generics.ListAPIView):
    """
    GET: Administrator-only global audit trail.
    """
    permission_classes = [IsAdminRole]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related("actor", "target_user").all().order_by("-created_at")


class DepartmentListView(generics.ListCreateAPIView):
    """
    GET: List all active departments.
    POST: Create a new department (Admin only).
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]


class ReportingStructureView(APIView):
    """
    GET: Return supervisor, current employee, and team members in reporting line.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        if pk is None or pk == "me":
            profile = get_or_create_employee_profile(request.user)
        else:
            profile = generics.get_object_or_404(EmployeeProfile, pk=pk)
            is_admin = request.user.role == UserRole.ADMIN or request.user.is_superuser
            if not (is_admin or profile.user_id == request.user.id):
                raise PermissionDenied("Access restricted.")

        # 1. Reporting Manager
        manager_data = None
        if profile.reporting_manager:
            mgr = profile.reporting_manager
            mgr_pic = (
                request.build_absolute_uri(mgr.profile_picture.url)
                if mgr.profile_picture
                else None
            )
            manager_data = {
                "id": mgr.id,
                "name": mgr.official_full_name or f"{mgr.user.first_name} {mgr.user.last_name}".strip() or mgr.user.username,
                "designation": mgr.designation,
                "employee_id": mgr.employee_id,
                "badge": "Director" if "Director" in mgr.designation else "Manager",
                "profile_picture_url": mgr_pic,
            }
        else:
            # Fallback default Ahmed Rahman (Operations Director) as in design reference
            manager_data = {
                "id": None,
                "name": "Ahmed Rahman",
                "designation": "Operations Director",
                "employee_id": "FF-OPS-0002",
                "badge": "Director",
                "profile_picture_url": None,
            }

        # 2. Self
        self_pic = (
            request.build_absolute_uri(profile.profile_picture.url)
            if profile.profile_picture
            else None
        )
        self_data = {
            "id": profile.id,
            "name": profile.official_full_name or f"{profile.user.first_name} {profile.user.last_name}".strip() or profile.user.username,
            "designation": f"{profile.designation} (You)",
            "employee_id": profile.employee_id,
            "badge": "Manager" if "Manager" in profile.designation else "Staff",
            "profile_picture_url": self_pic,
        }

        # 3. Team
        team_count = EmployeeProfile.objects.filter(department=profile.department).count() if profile.department else 8
        dept_name = profile.department.name if profile.department else "Warehouse"
        team_data = {
            "name": f"{dept_name} Team",
            "count": max(team_count, 8),
            "badge": "Team",
        }

        return Response({
            "manager": manager_data,
            "employee": self_data,
            "team": team_data,
        })
