#!/usr/bin/env python3
"""
Revert SuperAdmin credentials back to mock defaults.

Usage:
    python scripts/revert_mock_credentials.py

This script prints a browser console script that clears saved credentials
from localStorage, resetting the login back to mock credentials.
"""

MOCK_CREDENTIALS_KEY = "superAdminSavedCredentials"
AUTH_KEYS_TO_CLEAR = [
    "superAdminToken",
    "accessToken",
    "refreshToken",
    "tempToken",
    "userType",
    "isProfileComplete",
]


def generate_reset_script():
    """Generate a browser console script the user can paste."""
    keys_to_clear = AUTH_KEYS_TO_CLEAR + [MOCK_CREDENTIALS_KEY]

    script = "// === SuperAdmin Credential Reset Script ===\n"
    script += "// Paste this in your browser console (F12 -> Console)\n"
    script += "// while on the StayEasy/ServeIQ page\n\n"
    script += "const keys_to_clear = [\n"
    for key in keys_to_clear:
        script += f'  "{key}",\n'
    script += "];\n\n"
    script += "keys_to_clear.forEach(key => localStorage.removeItem(key));\n"
    script += "console.log('SuperAdmin credentials cleared!');\n"
    script += "console.log('Refresh the page and login with:');\n"
    script += "console.log('  Email: mock@serveiq.com');\n"
    script += "console.log('  Password: Admin@123');\n"
    script += "location.reload();\n"

    return script


def main():
    print("=" * 55)
    print("  SuperAdmin Credential Reset Tool")
    print("=" * 55)
    print()
    print("Copy the script below and paste it in your browser console:")
    print("(F12 -> Console tab -> Paste -> Press Enter)")
    print()
    print("-" * 55)
    print(generate_reset_script())
    print("-" * 55)
    print()
    print("After running the script, you can login with:")
    print("  Email: mock@serveiq.com")
    print("  Password: Admin@123")
    print()
    print("=" * 55)


if __name__ == "__main__":
    main()
