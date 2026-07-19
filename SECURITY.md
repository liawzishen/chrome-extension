# Security policy

## Supported version

Security fixes are applied to the latest `0.7.x` release line. Update to the newest release before reporting an issue that may already be fixed.

## Report a vulnerability privately

Please use the repository's [private vulnerability reporting form](https://github.com/liawzishen/chrome-extension/security/advisories/new). Do not publish an issue containing an API key, backend token, private browsing data, or working exploit details.

Include the affected version, a concise reproduction, expected impact, and any suggested mitigation. Use placeholder credentials and synthetic study material in screenshots or logs.

## Credential response

If a credential is exposed, revoke or rotate it at the provider first. Removing it from a later commit does not remove it from Git history. Then review the repository history and local logs before publishing a cleaned replacement.

## Local security model

- Provider API keys belong only in the backend `.env`; they must never be entered in the extension or committed.
- The bundled backend listens on `127.0.0.1`, validates allowed origins, bounds request size/rate/concurrency, and keeps provider destinations fixed.
- A custom remote backend receives the page text, notes, or tab-audio chunks the learner explicitly submits. Use HTTPS and a backend you control.
- Chrome extension local storage is not a password vault. Anyone with sufficient access to the operating-system account or browser profile may be able to read it.
- Build distributable extension folders with `npm run package:extension`; never load, zip, or publish the project root.
