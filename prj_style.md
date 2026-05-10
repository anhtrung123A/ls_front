# Google-like UI Coding Guide for AI Agent

## Goal

Build a clean, modern UI inspired by Google products and Material Design 3.

The UI should feel:
- Minimal
- Calm
- Spacious
- Accessible
- Fast
- Professional
- Similar to Google login, Google Workspace, Gmail, Classroom, Admin Console

Primary brand color:

```css
#0842a0
```

---

## Tech Stack Preference

Use this stack unless the project says otherwise:

```txt
React + TypeScript + Tailwind CSS
```

Optional:
- `shadcn/ui` for reusable primitives
- `lucide-react` or Material Symbols for icons
- `framer-motion` for subtle animations

Avoid heavy visual effects, gradients, glassmorphism, neon colors, or overly decorative UI.

---

## Design Principles

### 1. Google-like Simplicity

Prefer simple layouts with clear hierarchy.

Good:
- White background
- Light gray surfaces
- Clear typography
- Soft borders
- Subtle shadows
- Large spacing

Avoid:
- Dark heavy shadows
- Too many colors
- Complex gradients
- Crowded cards
- Over-designed components

---

## Color System

Use this palette:

```css
:root {
  --color-primary: #0842a0;
  --color-primary-hover: #06357f;

  --color-background: #ffffff;
  --color-surface: #f8fafd;
  --color-surface-alt: #f1f3f4;

  --color-border: #dadce0;

  --color-text: #202124;
  --color-text-muted: #5f6368;
  --color-text-subtle: #80868b;

  --color-error: #d93025;
  --color-success: #188038;
  --color-warning: #f9ab00;
}
```

Tailwind equivalents:

```txt
background: white
surface: #f8fafd
border: #dadce0
primary text: #202124
secondary text: #5f6368
primary blue: #0842a0
```

---

## Typography

Use system fonts similar to Google:

```css
font-family: Inter, Roboto, Arial, sans-serif;
```

Recommended sizes:

```txt
Page title: 28px - 32px
Section title: 20px - 24px
Card title: 16px - 18px
Body text: 14px - 16px
Helper text: 12px - 13px
```

Rules:
- Use medium weight for headings: `font-medium` or `font-semibold`
- Avoid overly bold text
- Keep body text readable
- Use muted text for descriptions

---

## Spacing

Use generous spacing.

Recommended Tailwind spacing:

```txt
Page padding: p-6 md:p-8
Card padding: p-6
Section gap: gap-6
Input vertical spacing: gap-4
Button padding: px-5 py-2.5
```

Avoid tight layouts.

---

## Border Radius

Google-like components usually use moderate radius.

```txt
Input: rounded-md or rounded-lg
Button: rounded-full or rounded-md
Card: rounded-xl or rounded-2xl
Dialog: rounded-2xl
```

Preferred:
```txt
rounded-xl
rounded-2xl
```

---

## Shadows

Use very soft shadows only.

Good:

```txt
shadow-sm
shadow-[0_1px_2px_rgba(60,64,67,0.1),0_1px_3px_rgba(60,64,67,0.08)]
```

Avoid:
```txt
shadow-xl
heavy black shadows
glow effects
```

---

## Layout Style

### Login / Auth Pages

Use Google login style:

- Centered card
- White background
- Large whitespace
- Step-based flow if needed
- Email step first
- Password step second
- Back and Next actions
- Floating label input
- Minimal animation between steps

Example structure:

```txt
Page
└── Center container
    └── Auth card
        ├── Logo / App name
        ├── Title
        ├── Description
        ├── Input field
        ├── Helper links
        └── Actions
            ├── Back / Forgot
            └── Next
```

---

## Buttons

### Primary Button

Use Google-like blue button.

```tsx
<button className="rounded-full bg-[#0842a0] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#06357f] focus:outline-none focus:ring-2 focus:ring-[#0842a0]/30">
  Next
</button>
```

### Text Button

```tsx
<button className="rounded-full px-4 py-2 text-sm font-medium text-[#0842a0] transition hover:bg-[#0842a0]/5">
  Forgot password?
</button>
```

Rules:
- Primary action on the right
- Secondary/text action on the left
- Use `rounded-full` for Google-like auth buttons
- Do not use too many button styles

---

## Inputs

Prefer outlined inputs with floating labels.

Style:

```txt
border: #dadce0
focus border: #0842a0
label color: #5f6368
focus label color: #0842a0
error color: #d93025
```

Input should have:
- Clear focus state
- Helper text
- Error text
- Accessible label

Example class:

```tsx
<input
  className="w-full rounded-md border border-[#dadce0] bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#0842a0] focus:ring-1 focus:ring-[#0842a0]"
/>
```

---

## Cards

Use cards for grouped content, not every small element.

```tsx
<div className="rounded-2xl border border-[#dadce0] bg-white p-6 shadow-sm">
  ...
</div>
```

Rules:
- Use border first
- Use shadow lightly
- Keep content aligned
- Avoid nested cards unless necessary

---

## Tables

For admin/student portal tables:

- White background
- Light border
- Sticky or clear header
- Row hover state
- Compact but readable
- Actions on the right

Example:

```txt
Header background: #f8fafd
Border: #dadce0
Hover: #f8fafd
Text: #202124
Muted text: #5f6368
```

---

## Forms

Form layout:
- One column by default
- Two columns only for related short fields
- Clear labels
- Helper text when needed
- Validation messages close to fields

Rules:
- Do not place too many fields in one row
- Group related fields into sections
- Use consistent spacing: `space-y-4` or `gap-4`

---

## Navigation

### Sidebar

Google-like sidebar:
- Light background
- Minimal icons
- Active item with pale blue background
- Rounded item
- Primary text for active item

```txt
Sidebar bg: white
Active bg: #e8f0fe or #0842a0/8
Active text: #0842a0
Inactive text: #5f6368
```

### Top Bar

Use:
- White background
- Bottom border
- Search bar if needed
- User avatar on the right

---

## Icons

Prefer Material Symbols if available.

Icon style:
- Outlined
- 20px or 24px
- Muted color by default
- Primary color only for active state

Avoid mixing too many icon styles.

---

## Animation

Use subtle animation only.

Good:
```txt
duration: 150ms - 250ms
ease-out
fade
slide 8px - 16px
scale 0.98 -> 1
```

Avoid:
```txt
bouncy animation
large movement
long transitions
looping effects
```

For auth step transition:
- Email step slides out left
- Password step slides in right
- Keep animation short and smooth

---

## Accessibility

Always include:
- Semantic HTML
- `label` for form input
- `aria-invalid` for invalid input
- Visible focus states
- Keyboard accessible buttons
- Sufficient contrast

Do not remove outlines unless replacing with custom focus ring.

---

## Component Rules

When generating UI code:

1. Create small reusable components.
2. Keep styling consistent.
3. Avoid hardcoded repeated class names when components can be reused.
4. Use TypeScript types for props.
5. Keep logic separate from presentation when possible.
6. Use meaningful component names.

Example components:

```txt
AuthLayout
GoogleButton
FloatingLabelInput
PageHeader
DataTable
EmptyState
StatusBadge
ConfirmDialog
```

---

## Student Portal UI Direction

For a student portal, use Google Workspace / Classroom inspired UI.

Recommended pages:
- Login
- Dashboard
- Courses
- Classes
- Schedule
- Payments
- Payroll / Staff salary if admin
- Profile
- Settings

Visual style:
- Clean dashboard cards
- Simple icons
- Table-heavy admin pages
- Calendar-like schedule view
- Minimal color usage

---

## Auth Page Requirements

For Google-like login screen:

Must include:
- Two-step form
  - Step 1: Email
  - Step 2: Password
- Floating label inputs
- Smooth transition between steps
- Minimal white card
- Primary color `#0842a0`
- Responsive layout
- Error state
- Loading state

Do not include:
- Heavy background image
- Complex illustration
- Too many links
- Neon/gradient effects

---

## Example Tailwind Theme Tokens

Use these classes frequently:

```txt
bg-white
bg-[#f8fafd]
text-[#202124]
text-[#5f6368]
border-[#dadce0]
bg-[#0842a0]
hover:bg-[#06357f]
focus:ring-[#0842a0]/30
rounded-xl
rounded-2xl
shadow-sm
```

---

## Quality Checklist

Before finishing UI code, verify:

- [ ] UI looks clean and Google-like
- [ ] Primary color is `#0842a0`
- [ ] Background is mostly white
- [ ] Spacing is generous
- [ ] Borders are light gray
- [ ] Shadows are subtle
- [ ] Inputs have focus states
- [ ] Buttons have hover/focus states
- [ ] Components are responsive
- [ ] Text hierarchy is clear
- [ ] No unnecessary gradients
- [ ] No heavy shadows
- [ ] No cluttered layout
- [ ] Code is TypeScript-friendly
- [ ] Components are reusable

---

## Prompt Instruction for AI Coding Agent

When implementing UI, follow this instruction:

```txt
Build the UI in a Google-like Material Design 3 style.

Use a minimal white layout, light gray borders, soft shadows, generous spacing, rounded corners, and primary color #0842a0.

The interface should look similar to Google Workspace / Google Login / Google Classroom: clean, calm, accessible, and professional.

Avoid gradients, neon colors, heavy shadows, crowded layouts, and overly decorative elements.

Use React + TypeScript + Tailwind CSS. Prefer reusable components and clean code structure.
```
