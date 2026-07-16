# Signing & notarizing Wellframe Desktop

The release workflow (`.github/workflows/desktop-release.yml`) signs and notarizes
**automatically** once the credentials below exist as GitHub repo secrets. Nothing is
signed until then — unsigned builds work but trip Gatekeeper (macOS) / SmartScreen
(Windows) on first launch. The Tauri config side is already done:
`tauri.conf.json` sets the macOS `entitlements.plist` (hardened-runtime JIT grants
required for notarization) and the Windows digest/timestamp.

You cannot sign without an Apple Developer account and certificate — those are yours to
create; the steps below are the whole path.

## macOS (Developer ID → signed + notarized `.dmg`)

1. **Enroll** in the Apple Developer Program ($99/yr): <https://developer.apple.com/programs/>.
2. **Create a "Developer ID Application" certificate** — Xcode → Settings → Accounts →
   Manage Certificates → **+** → Developer ID Application (or developer.apple.com →
   Certificates). It installs into your login Keychain.
3. **Export it as `.p12`** — Keychain Access → right-click the cert → Export → `.p12`,
   set a password.
4. **Base64-encode** it for the secret:
   ```bash
   base64 -i DeveloperID.p12 | pbcopy
   ```
5. **Find your identity + team** — the signing identity string is
   `Developer ID Application: Your Name (TEAMID)` (see `security find-identity -v -p codesigning`);
   the Team ID is on developer.apple.com → Membership.
6. **App-specific password** for notarization — <https://appleid.apple.com> → Sign-In and
   Security → App-Specific Passwords.
7. **Add repo secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `APPLE_CERTIFICATE` | the base64 from step 4 |
   | `APPLE_CERTIFICATE_PASSWORD` | the `.p12` password from step 3 |
   | `APPLE_SIGNING_IDENTITY` | `Developer ID Application: Your Name (TEAMID)` |
   | `APPLE_ID` | your Apple ID email |
   | `APPLE_PASSWORD` | the app-specific password from step 6 |
   | `APPLE_TEAM_ID` | your Team ID |

8. **Re-tag** to build: `git tag v0.1.1 && git push origin v0.1.1`. CI signs, notarizes,
   and staples the ticket into the `.dmg`.

**More robust notarization (optional):** instead of `APPLE_ID` + `APPLE_PASSWORD`, use an
App Store Connect API key — set `APPLE_API_ISSUER`, `APPLE_API_KEY` (the key ID), and
`APPLE_API_KEY_PATH` (the `.p8`), and add them to the workflow's `env:` block. This avoids
app-specific-password expiry and is the recommended CI path.

**Verify a downloaded build:**
```bash
spctl -a -vvv /Applications/Wellframe.app   # → "accepted … source=Notarized Developer ID"
codesign -dv --verbose=4 /Applications/Wellframe.app
```

## Windows (Authenticode)

Needs a code-signing certificate (OV/EV) or **Azure Trusted Signing** (no physical token,
CI-friendly). `tauri.conf.json` already sets the digest + timestamp; signing activates when
a cert is available on the runner:

- **Cert file:** in the workflow, import your `.pfx` (from a base64 secret) into the runner's
  cert store, then set `bundle.windows.certificateThumbprint` in `tauri.conf.json` (or via a
  build step) to that cert's thumbprint. Tauri signs the installer with `signtool`.
- **Azure Trusted Signing:** add the `azure/trusted-signing-action` step after the build, or
  Tauri's `signCommand`, using your Azure signing account. This is the modern, keyless route.

Windows is macOS-first's follow-up here — the config is staged; wire whichever cert path you
choose when you're ready to distribute Windows builds.
