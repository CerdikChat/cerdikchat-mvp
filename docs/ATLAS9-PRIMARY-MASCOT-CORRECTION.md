# ATLAS-9 Primary Mascot Correction

## Scope
- Replace the welcome-screen inline robot drawing with one canonical SVG asset at `src/atlas9-mascot.svg`.
- Reference the exact same URL from one image element at every viewport width.
- Use intrinsic SVG scaling and `object-fit: contain`; enlarge the desktop hero and give Android a viewport-aware maximum height.
- Keep all existing CerdikGo navigation, language, chat, authentication, prompt, and workspace logic intact.

## Changed files
- `src/atlas9-mascot.svg` — new white/blue armored ATLAS-9 mascot, cape, and thumbs-up vector artwork.
- `src/index.html` — shared asset markup and responsive presentation rules.
- `tests/mascot-consistency.test.mjs` — source-level checks for one asset, responsive sizing, and vector identity.
- `docs/ATLAS9-PRIMARY-MASCOT-CORRECTION.md` — this scope and acceptance record.

## Safety
Frontend static asset and presentation only. No Worker/API, OAuth, D1/database, secrets, Wrangler configuration, billing, DNS, or deployment changes.

## Verification limits
Automated tests can prove that both breakpoints use the same asset and that the vector is scalable. They cannot prove pixel-level equivalence to the supplied reference or physical Android rendering. The reference image must be available side-by-side for final visual acceptance; desktop and Android screenshots must be captured from an isolated Preview before claiming 100% visual fidelity.
