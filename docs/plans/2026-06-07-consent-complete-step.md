# Consent Complete step (post-ToS completion screen)

## Goal
After a user agrees to the Terms of Service in the `seiyaku` flow (`ConsentGate`),
show a dedicated completion screen explaining that an eKYC invitation email will
follow — instead of jumping straight into `StepEkycIntro`. Testers need a way to
skip ahead to the eKYC intro screen manually, since the real flow requires opening
a follow-up email.

## New component: `StepConsentComplete`
- Layout mirrors `StepComplete`: logo-only sticky header (no progress bar — not a
  counted step, matches `ConsentGate`/`StepEkycIntro` pre-step treatment), white
  card, success-icon hero, `カスタマーセンター` contact section.
- Hero copy:
  - Heading: 同意書の受諾が完了しました
  - Body: ご同意いただきありがとうございます。本人確認（eKYC）のご案内を、追ってメールにてお送りいたします。メールに記載のリンクより、お手続きをお進みください。
- Tester nav button: outlined button (accent-green border/text on white),
  label `eKYC画面へ進む（テスター用）`, calls `onProceed`.
- Tester note directly below the button:
  ※ このボタンはデモ・テスト用です。実際のユーザーはメールのリンクからeKYC画面に遷移します。

## Shared extraction
`ContactCard` moves out of `StepComplete.tsx` into `components/ContactCard.tsx`
so both screens can use it without duplication.

## Wiring (`App.tsx`)
- New `AppStep` value: `"consent-complete"`.
- `ConsentGate.onProceed` → `"consent-complete"` (was `"ekyc"`).
- `StepConsentComplete.onProceed` → `"ekyc"`.

## Testing
New `StepConsentComplete.test.tsx` mirroring `StepEkycIntro.test.tsx`: renders
heading/body copy, renders the tester button and note, calls `onProceed` on click.
