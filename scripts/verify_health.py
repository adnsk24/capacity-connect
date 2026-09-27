"""Verification script for Capacity Connect Phase 0 infrastructure."""

import sys
import urllib.request
import json


def check_endpoint(url: str, name: str) -> bool:
    print(f"[*] Checking {name} at {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HealthCheck/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            content = response.read().decode("utf-8")
            if status == 200:
                print(f"[+] {name} is UP! (HTTP {status})")
                try:
                    parsed = json.loads(content)
                    print(f"    Payload: {json.dumps(parsed, indent=2)}")
                except Exception:
                    print(f"    HTML/Text returned ({len(content)} bytes)")
                return True
            else:
                print(f"[-] {name} returned HTTP {status}")
                return False
    except Exception as exc:
        print(f"[-] {name} connection failed: {exc}")
        return False


if __name__ == "__main__":
    backend_ok = check_endpoint("http://localhost:8000/api/v1/health", "Backend API Health")
    frontend_ok = check_endpoint("http://localhost:5173", "Frontend Vite Dev Server")

    print("\n================ Verification Summary ================")
    print(f"Backend  (/api/v1/health) : {'OPERATIONAL' if backend_ok else 'DOWN / NOT RUNNING'}")
    print(f"Frontend (http://localhost:5173): {'OPERATIONAL' if frontend_ok else 'DOWN / NOT RUNNING'}")
    print("======================================================")

    if backend_ok and frontend_ok:
        sys.exit(0)
    else:
        sys.exit(1)
