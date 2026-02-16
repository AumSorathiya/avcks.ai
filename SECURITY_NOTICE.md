# SEC-03: Hardcoded Password Security Issue

## Issue Description

The authentication system in `LoginModule.js` uses a hardcoded password `"AVCKS-01"` that is visible in plain text in the source code. This is a security vulnerability as anyone inspecting the browser DevTools or viewing the source code can see the password.

## Location

**File:** `js/modules/LoginModule.js`  
**Line:** 11  
**Code:** `this.correctCode = "AVCKS-01";`

## Security Impact

- **Severity:** Medium (for a demo/prototype)
- **Risk:** Anyone can bypass authentication by viewing the source code
- **Exposure:** Password is visible in browser DevTools, GitHub repository, and any deployed version

## Recommended Solutions

### Option 1: Remove Authentication (Simplest for Demo)
Since this is a web-based demo without a backend, remove the authentication overlay entirely or make it purely cosmetic.

### Option 2: Use localStorage (Better for Personalization)
Allow users to set their own password on first launch:
```javascript
// First time setup
if (!localStorage.getItem('avcks_auth_code')) {
    // Show setup screen to create password
    const userCode = prompt('Set your AVCKS authorization code:');
    localStorage.setItem('avcks_auth_code', userCode);
}

// Login check
const storedCode = localStorage.getItem('avcks_auth_code');
if (inputCode === storedCode) {
    // Grant access
}
```

### Option 3: Backend Authentication (Production-Ready)
For a production system, implement proper backend authentication with:
- Hashed passwords (bcrypt, Argon2)
- Session management
- JWT tokens
- Rate limiting

## Current Status

**NOT FIXED** - This is documented as a known limitation. The hardcoded password remains in the code for demo purposes. Users should be aware that this is not secure and should not be used for protecting sensitive data.

## Notes for Developers

- This authentication is **cosmetic only** for the demo
- Do not use this pattern in production applications
- Consider removing auth entirely or implementing proper backend authentication
- If keeping for demo, add a comment warning about the security limitation

---

**Documented:** 2026-02-16  
**Priority:** Low (for demo), High (for production use)
