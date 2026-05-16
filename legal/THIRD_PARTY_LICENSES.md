# Third-Party Licenses

Use this file to track package licenses and attribution requirements for Moonlit Firefly Bloom.

The current dependency list should be regenerated before launch from `package.json` and `package-lock.json`. Do not rely on this file as the only license audit.

## Recommended Checks Before Launch

Example commands to consider before commercial release:

```bash
npm ls
npm view vite license
npm view typescript license
npx license-checker --summary
npx license-checker --production
```

Do not install or run extra tools in normal development unless the project owner requests it.

## Direct Dependencies

| Package | Version | License | Purpose | Attribution required? | Notes |
| --- | --- | --- | --- | --- | --- |
| vite | ^6.3.5 | TODO | Browser dev server and production build tooling | TODO | Dev dependency. Confirm exact resolved version and license before launch. |
| typescript | ^5.8.3 | TODO | Type checking and TypeScript compilation | TODO | Dev dependency. Confirm exact resolved version and license before launch. |

## Transitive Dependencies

Transitive packages are listed in `package-lock.json` and should be audited before launch. Keep third-party notices if any package requires attribution, notice preservation, or source disclosure.

## Launch Notes

- Before commercial launch, run a dependency license audit.
- Keep third-party notices if required.
- Recheck licenses after dependency upgrades.
- Avoid copying proprietary code, paid templates, or unlicensed snippets into the project.

