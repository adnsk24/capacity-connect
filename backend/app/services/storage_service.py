import os
import re
import uuid
import mimetypes
from pathlib import Path
from typing import Tuple, Optional
from urllib.parse import urlparse
from fastapi import HTTPException, UploadFile, status

# Logical storage folders
MEDIA_PATHS = {
    "VIDEO": "course-media/videos",
    "EXTERNAL_VIDEO": "course-media/videos",
    "AUDIO": "course-media/audio",
    "DOCUMENT": "course-media/documents",
    "PRESENTATION": "course-media/documents",
    "PDF": "course-media/documents",
    "PPT": "course-media/documents",
    "THUMBNAIL": "course-media/thumbnails",
}

# Permitted MIME types
ALLOWED_MIME_TYPES = {
    "VIDEO": {
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
    },
    "AUDIO": {
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/x-m4a",
        "audio/aac",
        "audio/ogg",
        "audio/webm",
    },
    "DOCUMENT": {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
        "application/rtf",
    },
    "PRESENTATION": {
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/pdf",
    },
    "THUMBNAIL": {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
    },
}

# Max file size limits in bytes
MAX_FILE_SIZES = {
    "VIDEO": 100 * 1024 * 1024,       # 100 MB
    "AUDIO": 30 * 1024 * 1024,        # 30 MB
    "DOCUMENT": 25 * 1024 * 1024,     # 25 MB
    "PRESENTATION": 25 * 1024 * 1024, # 25 MB
    "THUMBNAIL": 10 * 1024 * 1024,    # 10 MB
}


class StorageService:
    BASE_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"

    @classmethod
    def ensure_directories(cls):
        """Creates the logical storage subdirectories if they do not exist."""
        for path_suffix in MEDIA_PATHS.values():
            full_path = cls.BASE_UPLOAD_DIR / path_suffix
            full_path.mkdir(parents=True, exist_ok=True)

    @classmethod
    def validate_external_url(cls, url: str) -> str:
        """Sanitizes and validates an external video/audio URL.
        Only allows safe HTTP/HTTPS protocols and rejects script/data injections.
        """
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="External video URL cannot be empty.",
            )

        url = url.strip()
        parsed = urlparse(url)

        if parsed.scheme.lower() not in ("http", "https"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only HTTP and HTTPS URLs are permitted for external video resources.",
            )

        # Disallow localhost / metadata address SSRF vectors if necessary
        netloc = parsed.netloc.lower()
        if netloc in ("localhost", "127.0.0.1", "::1", "169.254.169.254"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid external video host.",
            )

        # Check for dangerous characters
        if any(c in url for c in ("<", ">", '"', "'", ";", "{", "}")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="External URL contains illegal characters.",
            )

        return url

    @classmethod
    def validate_file(
        cls,
        upload_file: UploadFile,
        resource_type: str,
    ) -> Tuple[str, int]:
        """Validates MIME type and file size.
        Returns (detected_mime, file_size_bytes).
        """
        target_type = resource_type.upper()
        if target_type in ("PDF", "PPT"):
            target_type = "PRESENTATION" if target_type == "PPT" else "DOCUMENT"

        allowed_mimes = ALLOWED_MIME_TYPES.get(target_type)
        if not allowed_mimes:
            allowed_mimes = ALLOWED_MIME_TYPES["DOCUMENT"]

        # Content-type from upload
        content_type = upload_file.content_type or ""
        # Also infer from filename as secondary check
        guessed_type, _ = mimetypes.guess_type(upload_file.filename or "")

        effective_mime = content_type.lower()
        if effective_mime not in allowed_mimes and guessed_type and guessed_type.lower() in allowed_mimes:
            effective_mime = guessed_type.lower()

        if effective_mime not in allowed_mimes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported media MIME type '{effective_mime}' for resource type '{resource_type}'. "
                    f"Allowed types: {', '.join(sorted(allowed_mimes))}"
                ),
            )

        # Inspect file size
        max_size = MAX_FILE_SIZES.get(target_type, 25 * 1024 * 1024)
        upload_file.file.seek(0, os.SEEK_END)
        size_bytes = upload_file.file.tell()
        upload_file.file.seek(0)

        if size_bytes > max_size:
            max_mb = max_size / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum limit of {max_mb:.0f} MB.",
            )

        return effective_mime, size_bytes

    @classmethod
    async def save_uploaded_file(
        cls,
        upload_file: UploadFile,
        resource_type: str,
    ) -> Tuple[str, str, int, str]:
        """Validates and persists uploaded file to the appropriate logical directory.
        Returns: (storage_url, file_name, file_size_bytes, mime_type)
        """
        cls.ensure_directories()
        mime_type, size_bytes = cls.validate_file(upload_file, resource_type)

        target_type = resource_type.upper()
        if target_type in ("PDF", "PPT"):
            target_type = "PRESENTATION" if target_type == "PPT" else "DOCUMENT"

        folder_suffix = MEDIA_PATHS.get(target_type, "course-media/documents")
        dest_dir = cls.BASE_UPLOAD_DIR / folder_suffix

        # Sanitize original filename
        raw_name = Path(upload_file.filename or "file").name
        clean_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", raw_name)
        unique_prefix = uuid.uuid4().hex[:12]
        final_filename = f"{unique_prefix}_{clean_name}"

        destination_path = dest_dir / final_filename
        contents = await upload_file.read()
        with open(destination_path, "wb") as f:
            f.write(contents)

        # Logical storage URL relative to root
        storage_url = f"/uploads/{folder_suffix}/{final_filename}"
        return storage_url, clean_name, size_bytes, mime_type
