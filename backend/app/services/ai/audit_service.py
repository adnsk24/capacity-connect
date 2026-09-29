import time
import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.ai import AIAuditLog
from app.core.config import settings


class AIAuditService:
    """Audit logger for AI requests and observability."""

    @classmethod
    def log_interaction(
        cls,
        db: Session,
        user_id: uuid.UUID,
        feature: str,
        source_resource_ids: Optional[List[uuid.UUID]],
        provider: str,
        model: str,
        status_code_str: str,
        latency_ms: int,
    ) -> AIAuditLog:
        res_str = ",".join(str(r) for r in source_resource_ids) if source_resource_ids else None
        log_entry = AIAuditLog(
            id=uuid.uuid4(),
            user_id=user_id,
            feature=feature,
            source_resource_ids=res_str,
            provider=provider or settings.AI_PROVIDER,
            model=model or settings.AI_MODEL,
            status=status_code_str,
            latency_ms=latency_ms,
        )
        db.add(log_entry)
        try:
            db.commit()
        except Exception:
            db.rollback()
        return log_entry
