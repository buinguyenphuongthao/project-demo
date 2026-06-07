# Design System Reference

## Global Tokens (`src/index.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-page` | `#f9f5ee` | Body background (mobile) |
| `--color-page-md` | `#eeeae3` | Body background (≥768px) |
| `--color-surface` | `#ffffff` | Cards, inputs |
| `--color-accent-primary` | `#388e31` | CTAs, active states, progress bar |
| `--color-accent-primary-depth` | `#1d7116` | CTA shadow depth, active text |
| `--color-accent-secondary` | `#f3840d` | Secondary accents |
| `--color-badge` | `#df4726` | Notification badges |
| `--color-link` | `#2383e2` | Hyperlinks |
| `--color-option-selected` | `#deecfb` | Selected option background |
| `--color-option-bg` | `#f0f0f0` | Option default background |

**Font:** `"Noto Sans JP", "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", "Meiryo", sans-serif`  
**Root font-size:** `15px` → `1rem = 15px`, `text-base = 15px`, `text-sm ≈ 13px`  
**Root line-height:** `1.5`

---

## Button — Primary CTA (`.button-background`)

Used for all primary "次へ" actions across steps.

```
.button-background
  background: arrow icon (right-aligned, white SVG from takakuureru.com)
  hover: inset shadow
  active: translateY(4px) + shadow removed (press animation)
  focus-visible: 3px outline in accent-primary
```

**`PrimaryButton` component** (`src/components/PrimaryButton.tsx`):
- Height: `h-[69px]`, `rounded-[10px]`
- Font: `text-[20px] font-semibold`
- Enabled: `bg-accent-primary`, depth shadow `0_8px_0_0_var(--color-accent-primary-depth)`
- Disabled: `bg-gray-300`, depth shadow `0_8px_0_0_#b0b0b0`

> Used in: ConsentGate (Step 0). **Not** used in Step 1 (uses inline button with same visual style, smaller size).

---

## Step 0 — ConsentGate (`src/components/ConsentGate.tsx`)

- Layout: flat, no card — `mx-auto w-full max-w-4xl p-4 pb-5`
- Header: logo left (`HeaderLogo`), centered `<h1>` title, invisible spacer right
- Body text: `text-sm text-gray-600`
- Terms box: `rounded-lg bg-page p-4 sm:p-5`
- Checkbox label: `text-sm font-semibold`
- CTA: `PrimaryButton` centered, max-width `400px`
- No progress bar (Step 0 is not counted in the step flow)

---

## Step 1 — PersonalInfo (`src/components/Step1PersonalInfo.tsx`)

### Sticky Header
```
bg-white
shadow-[0_2px_12px_rgba(0,0,0,0.08)]
px-5 pt-3 pb-3
```
- Logo: `h-[64px]` (takaku_logo.svg)
- Step label: `text-xs text-gray-500 mb-1.5` — "4ステップ中 1"
- Progress pills: 4 × `w-12 h-2 rounded-full` — active = `bg-accent-primary`, inactive = `bg-gray-300`

### Content Card
```
bg-white rounded-2xl border border-gray-200
shadow-[0_2px_12px_rgba(0,0,0,0.04)]
p-5 sm:p-8
max-w-3xl
```
- Page background remains `bg-page` (`#f9f5ee`) — card floats on top
- Content padding on mobile: `px-4 py-5`, bottom pad `pb-24` (clears sticky CTA)

### Section Heading
```
text-xl font-bold text-[#1F2329]
```
- Includes green person SVG icon (20×20, stroke `var(--color-accent-primary)`)

### Field Labels
```
text-base font-normal text-[#1F2329]
```
- `mb-2` gap between label row and input
- `mb-5` between fields

### Required / Optional Badges
| Badge | Color | Style |
|-------|-------|-------|
| 必須 (required) | `#F36B6B` (red) | `text-[11px] font-normal px-2 py-[3px] rounded-[5px] text-white` |
| 任意 (optional) | `#F59E0B` (amber) | same shape/size, different bg |

### Input Fields
```
h-[52px] px-4
text-base text-[#1F2329]
bg-white border border-gray-300 rounded-lg
placeholder: text-[#A8AEB8]
hover: border-gray-400
focus: border-[#4A90D9] + shadow-[0_0_0_3px_rgba(74,144,217,0.18)]
disabled: opacity-50
```

### Select Wrapper
- Custom chevron: `rotate-45 w-[9px] h-[9px] border-r-2 border-b-2 border-[#6B7280]`
- Positioned `right-[18px]`, vertically centered

### Validation Errors
```
text-xs text-[#F36B6B] font-medium
```
Appears below the field, `mt-1`.

### CheckCard (Invoice toggle)
```
px-4 py-3.5 rounded-[8px] border-2 cursor-pointer mb-4
```
- Unchecked: `border-gray-200 bg-white`
- Checked: `border-accent-primary bg-[#f0faf0]`
- Custom checkbox: `w-6 h-6 rounded-[5px] border-2`; checkmark SVG in `accent-primary`
- Label: `text-base font-normal`
- Sublabel: `text-xs text-[#6B7280] mt-0.5`

### CTA Buttons
**Desktop** (`hidden sm:flex`):
- Primary: `button-background`, `max-w-[480px]`, `rounded-[10px] py-4`, `text-[17px] font-bold`
- Enabled: `bg-accent-primary`; Disabled: `bg-gray-300 cursor-not-allowed`
- Back link: `text-sm text-gray-500 underline`

**Mobile** (`sm:hidden fixed bottom-0`):
- `bg-white border-t border-gray-200 px-5 py-3.5`
- Same button style as desktop but full width
- Back link below button: `w-full mt-2 py-1.5 text-sm text-gray-500 underline`

---

## Layout Patterns

### Max-widths
| Context | Max-width |
|---------|-----------|
| Step 0 content | `max-w-4xl` (896px) |
| Step 1 header inner | `max-w-3xl` (768px) |
| Step 1 card | `max-w-3xl` (768px) |
| CTA (desktop) | `max-w-[480px]` |
| CTA (Step 0) | `max-w-[400px]` |

### Responsive breakpoints
- Mobile-first; `sm:` = 640px
- Mobile CTA: fixed bottom bar (`sm:hidden`)
- Desktop CTA: inline at card bottom (`hidden sm:flex`)
- Card padding: `p-5` mobile → `sm:p-8` desktop

---

## Typography Scale

| Use | Class | Computed |
|-----|-------|----------|
| Section heading | `text-xl font-bold` | 20px bold |
| Field labels | `text-base font-normal` | 15px regular |
| Input text | `text-base` | 15px |
| CTA button | `text-[17px] font-bold` | 17px bold |
| Step label | `text-xs` | ~12px |
| Error / sublabel | `text-xs` | ~12px |
| Badge text | `text-[11px]` | 11px |
| Back link | `text-sm` | ~13px |

---

## Key Design Decisions

1. **White card on warm page background** — card (`bg-white`, `rounded-2xl`, subtle shadow) floats over `#f9f5ee` warm background, not a flat full-bleed layout.
2. **Sticky header with shadow** — provides scroll context; `shadow-[0_2px_12px_rgba(0,0,0,0.08)]` is intentionally more prominent than card shadow.
3. **Always-visible form fields** — replaced previous tap-to-edit rows; all inputs shown upfront.
4. **Blue focus ring on inputs** — `#4A90D9` with soft glow; deliberate departure from green accent to match standard form UX convention.
5. **Amber for 任意, Red for 必須** — `#F59E0B` amber feels softer/optional; `#F36B6B` red signals required clearly without being alarming.
6. **font-normal labels** — `font-bold` labels felt heavy at `text-base` (15px); `font-normal` matches reference screenshot and reduces visual noise.
