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
   > **Signing needs the certificate above — an API key does NOT sign.** A live build is
   > two separate things: **sign** with the Developer ID cert (steps 1–5), then **notarize**
   > (below). You need both.

6. **Notarization — App Store Connect API key** (the workflow is wired for this). Create a
   key at App Store Connect → Users and Access → Integrations → App Store Connect API →
   generate a key with the **Developer** role. You get an **Issuer ID**, a **Key ID**, and a
   one-time `AuthKey_<KEYID>.p8` download. Base64 it for the secret:
   ```bash
   base64 -i AuthKey_<KEYID>.p8 | pbcopy
   ```
7. **Add repo secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `APPLE_CERTIFICATE` | base64 of the Developer ID `.p12` (step 4) |
   | `APPLE_CERTIFICATE_PASSWORD` | the `.p12` password (step 3) |
   | `APPLE_SIGNING_IDENTITY` | `Developer ID Application: Your Name (TEAMID)` |
   | `APPLE_TEAM_ID` | your Team ID |
   | `APPLE_API_ISSUER` | the API key's Issuer ID |
   | `APPLE_API_KEY` | the API key's Key ID |
   | `APPLE_API_KEY_P8` | base64 of the `.p8` file (step 6) |

   The `.p8` file is a **private key** — only ever paste it into the `APPLE_API_KEY_P8` secret,
   never into a file, commit, or chat. The workflow decodes it to a temp file at build time.

8. **Re-tag** to build: `git tag v0.1.1 && git push origin v0.1.1`. CI signs with the
   certificate, notarizes via the API key, and staples the ticket into the `.dmg`.

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
