from django.urls import path
from .views import (
    AuditLogListView,
    DepartmentListView,
    EmployeeActivateView,
    EmployeeActivityView,
    EmployeeDetailView,
    EmployeeListCreateView,
    EmployeeMeView,
    EmployeeSuspendView,
    MyActivityView,
    ProfilePictureUploadView,
    ReportingStructureView,
)

urlpatterns = [
    # Current User Profile
    path("me/", EmployeeMeView.as_view(), name="employee-me"),
    path("me/profile-picture/", ProfilePictureUploadView.as_view(), name="employee-me-profile-picture"),
    path("me/activity/", MyActivityView.as_view(), name="employee-me-activity"),
    path("me/reporting-structure/", ReportingStructureView.as_view(), name="employee-me-reporting-structure"),

    # Administrative Employee Directory & Provisioning
    path("", EmployeeListCreateView.as_view(), name="employee-list-create"),
    path("<int:pk>/", EmployeeDetailView.as_view(), name="employee-detail"),
    path("<int:pk>/activate/", EmployeeActivateView.as_view(), name="employee-activate"),
    path("<int:pk>/suspend/", EmployeeSuspendView.as_view(), name="employee-suspend"),
    path("<int:pk>/activity/", EmployeeActivityView.as_view(), name="employee-activity"),
    path("<int:pk>/reporting-structure/", ReportingStructureView.as_view(), name="employee-reporting-structure"),

    # Shared Organization & Global Audit Endpoints
    path("departments/", DepartmentListView.as_view(), name="department-list"),
    path("audit-logs/", AuditLogListView.as_view(), name="audit-log-list"),
]
