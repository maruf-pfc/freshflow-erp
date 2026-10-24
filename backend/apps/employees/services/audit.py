"""
FreshFlow ERP — Centralized Append-Only Audit Logging Service
"""

import copy
import logging
from typing import Any, Dict, Optional
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

# Keys that must NEVER be recorded in audit logs
SENSITIVE_KEYS = {
    "password",
    "token",
    "access",
    "refresh",
    "secret",
    "authorization",
    "credit_card",
    "cvv",
    "new_password",
    "old_password",
    "confirm_password",
}


def sanitize_metadata(data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Recursively scrub any sensitive keys or secrets from audit metadata."""
    if not isinstance(data, dict):
        return {}

    sanitized = {}
    for key, value in data.items():
        if any(s in key.lower() for s in SENSITIVE_KEYS):
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_metadata(value)
        elif isinstance(value, (list, tuple)):
            sanitized[key] = [
                sanitize_metadata(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    return sanitized


def get_client_ip(request) -> Optional[str]:
    """Safely extract remote client IP address from standard HTTP headers."""
    if not request:
        return None
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip[:45] if ip else None


def get_client_user_agent(request) -> str:
    """Safely extract and truncate user agent string."""
    if not request:
        return ""
    ua = request.META.get("HTTP_USER_AGENT", "")
    return ua[:255] if ua else ""


def record_audit_event(
    action: str,
    category: str,
    description: str,
    actor=None,
    target_user=None,
    resource_type: str = "",
    resource_id: str = "",
    metadata: Optional[Dict[str, Any]] = None,
    request=None,
):
    """
    Append an immutable event to the audit trail.
    Guarantees sanitized payload, server-side timestamp, and fail-safe persistence.
    """
    from apps.employees.models import AuditLog

    # Determine actor from request if not explicitly provided
    if actor is None and request and hasattr(request, "user") and request.user.is_authenticated:
        actor = request.user

    ip_address = get_client_ip(request)
    user_agent = get_client_user_agent(request)
    cleaned_metadata = sanitize_metadata(metadata)

    try:
        log_entry = AuditLog.objects.create(
            actor=actor if actor and actor.is_authenticated else None,
            target_user=target_user,
            action=action.strip()[:100],
            category=category.upper().strip()[:50],
            description=description.strip(),
            resource_type=resource_type.strip()[:50],
            resource_id=str(resource_id)[:50],
            metadata=cleaned_metadata,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return log_entry
    except Exception as exc:
        logger.error("Failed to write audit log entry: %s", exc, exc_info=True)
        return None
