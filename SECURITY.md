# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | Yes |

The kit is pre-1.0: only the latest 0.1.x release receives security fixes.

## Reporting a vulnerability

Report vulnerabilities privately via GitHub Security Advisories on
[PerryLink/dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit/security/advisories/new),
with a minimal reproduction. Expect an initial response within 7 days. Do not
open public issues for vulnerabilities.

## In scope

- Approval gates that default to a grant.
- Session-event appends that could corrupt or crash session resume.
- PII plaintext leaking through `sanitize`/`redact*` outputs.

## Out of scope

- `sanitize`/`redact*` are display hygiene, not a security boundary: they
  reduce leakage, they cannot stop a determined exfiltration path.
- Harness vulnerabilities: report those to the DeepSeek Harness repository.
