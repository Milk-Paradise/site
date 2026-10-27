# Milkshake Studio

## Direction
User selected a close adaptation of https://www.superr.ai/ on 2026-10-27 and authorized immediate implementation. Russian marketing site for small businesses; primary action is discussing a website project.

## Visual system
Warm white #faf9f6, chocolate #2c1b0e, orange #ff7926, pale peach #fff0df, muted brown #796b60. Rounded heavy Nunito headings; Golos Text body; occasional italic Georgia editorial annotations. Fonts served locally with licenses.

## Layout and signature
Airy centered introductory headline above a tactile sketchbook showing small-business websites. Outlined rounded buttons with a second offset contour, warm paper cards, generous vertical rhythm. Orange is an accent and pricing-section background. No fake client claims or testimonials.

## Runtime owners
Light tokens, typography and composition: src/styles/pop.css. Shared layout and control behavior: src/styles/base.css and src/styles/polish.css. Dark theme: src/styles/dark.css. Local fonts: src/styles/fonts.css. Hero: src/components/studio-hero.tsx. Form selection: src/components/form-select.tsx. Existing pricing and content config remain authoritative.

## Behavior
Preserve the dark design, persistent theme toggle, mobile menu, anchor navigation, native FAQ disclosure, pricing and lead pipeline. Keep header geometry identical across themes. Form dropdowns use keyboard-operable listboxes with selected values submitted as form fields. Light hero is hidden in dark theme and original hero hidden in light theme. Respect reduced motion; layouts fit 320px through desktop. No additional third-party scripts.

## Launch requirements
Form delivery uses Telegram; Turnstile and Redis are not required at the user's request. Keep PRIVACY_READY=false until the policy, consent, mailbox and data-processing arrangements are checked. No publishing requested.
