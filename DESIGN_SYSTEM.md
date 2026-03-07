# Cricket Auction - Design System (7Seers Inspired)

## ✅ Applied Styles from 7Seers Student 2.0

### Color Palette

**Primary Colors:**
- `primary`: #2563EB (Blue) - Main brand color
- `primary-dark`: #1E40AF - Darker shade for hover states
- `primary-light`: #EFF6FF - Light shade for backgrounds

**Secondary Colors:**
- `secondary`: #0D9488 (Teal) - Secondary actions
- `accent-coral`: #FB7185 - Destructive/delete actions
- `accent-teal`: #2DD4BF - Accents
- `accent-yellow`: #FACC15 - Highlights

**Neutral Colors:**
- `background-light`: #F3F4F6 - Page backgrounds
- `surface-light`: #ffffff - Card backgrounds
- `text-main`: #111827 - Primary text
- `text-muted`: #6B7280 - Secondary text
- `border-light`: #E5E7EB - Borders

### Typography

**Fonts:**
- Primary: **Manrope** (with fallbacks: Inter, system-ui)
- Monospace: ui-monospace, SFMono-Regular, Menlo, Monaco

**Font Sizes (Responsive):**
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)
- 6xl: 3.75rem (60px)

**Typography Features:**
- ✅ Font smoothing (antialiased)
- ✅ Optimized text rendering
- ✅ Consistent letter-spacing
- ✅ Better kerning
- ✅ Cross-platform normalization

### Button Variants

**1. Primary (default)**
```css
bg-primary text-white hover:bg-primary-dark
```
- Color: Blue (#2563EB)
- Text: White
- Hover: Darker blue (#1E40AF)
- Shadow on hover

**2. Secondary**
```css
bg-secondary text-white hover:bg-secondary/90
```
- Color: Teal (#0D9488)
- Text: White
- Hover: 90% opacity

**3. Outline**
```css
border-2 border-primary bg-transparent text-primary hover:bg-primary-light
```
- Border: Blue 2px
- Background: Transparent
- Text: Blue
- Hover: Light blue background

**4. Destructive**
```css
bg-accent-coral text-white hover:bg-accent-coral/90
```
- Color: Coral/Pink (#FB7185)
- Text: White
- Used for delete/remove actions

**5. Ghost**
```css
hover:bg-background-light hover:text-primary
```
- No background
- Hover: Light gray background

**6. Link**
```css
text-primary underline-offset-4 hover:underline
```
- Styled as link
- Underline on hover

### Border Radius

- DEFAULT: 0.25rem (4px)
- lg: 0.5rem (8px)
- xl: 0.75rem (12px)
- 2xl: 1rem (16px)
- 3xl: 1.5rem (24px)
- 4xl: 24px
- full: 9999px (fully rounded)

### Shadows

- **soft**: `0 4px 20px -2px rgba(0, 0, 0, 0.05)` - Subtle depth
- **glow**: `0 0 15px rgba(37, 99, 235, 0.3)` - Blue glow effect

### Animations

**Keyframes Applied:**
- `fadeIn` - Fade in effect
- `fadeOut` - Fade out effect
- `scaleIn` - Scale in from center
- `slideInRight` - Slide from right
- `slideOutRight` - Slide out to right
- `slideInUp` - Slide up from bottom
- `cardEntrance` - Card appearing animation
- `shake` - Shake effect (error feedback)
- `modalShake` - Modal shake on invalid click
- `float` - Floating animation
- `blob` - Blob morphing animation

### Scrollbar Styling

**Global Thin Scrollbar:**
- Width: 6px
- Color: rgba(148, 163, 184, 0.5)
- Hover: rgba(148, 163, 184, 0.8)
- Border radius: 10px
- Transparent track

### Special Features

**1. Text Selection:**
- Background: #3b82f6 (Blue)
- Color: White

**2. Button Press Effect:**
- All buttons have `btn-press` class
- Active: `transform: scale(0.95)`
- Smooth transition

**3. Cursor Pointer:**
- ✅ All buttons have `cursor: pointer` by default

**4. Responsive Typography Utilities:**
- `.text-heading-1` through `.text-heading-6`
- `.text-body-lg`, `.text-body`, `.text-body-sm`
- `.text-caption`, `.text-label`
- `.text-truncate`, `.text-clamp-1` through `.text-clamp-4`

**5. Font Smoothing:**
- ✅ Cross-platform font smoothing
- ✅ Optimized for Linux, Windows, macOS

**6. Accessibility:**
- ✅ Reduced motion support
- ✅ Focus visible states
- ✅ ARIA-compliant animations

## Button Size Variants

**Small:**
- Height: 36px (h-9)
- Padding: 16px (px-4)
- Font: xs

**Default:**
- Height: 40px (h-10)
- Padding: 20px (px-5)
- Font: sm

**Large:**
- Height: 48px (h-12)
- Padding: 32px (px-8)
- Font: base

**Icon:**
- Size: 40x40px (h-10 w-10)

## Example Button Usage

```tsx
// Primary button (blue)
<Button>Submit</Button>
<Button variant="default">Submit</Button>

// Secondary button (teal)
<Button variant="secondary">Save Draft</Button>

// Outline button
<Button variant="outline">Cancel</Button>

// Destructive button (coral/pink)
<Button variant="destructive">Delete</Button>

// Ghost button
<Button variant="ghost">View More</Button>

// Link button
<Button variant="link">Learn More</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading>Processing...</Button>
```

## Color Combinations

**Primary Actions:**
- Background: Blue (#2563EB)
- Text: White
- Hover: Darker Blue (#1E40AF)

**Secondary Actions:**
- Background: Teal (#0D9488)
- Text: White
- Hover: 90% opacity

**Dangerous Actions:**
- Background: Coral (#FB7185)
- Text: White
- Hover: 90% opacity

**Neutral Actions:**
- Background: Transparent
- Border: Blue
- Text: Blue
- Hover: Light blue background

## Typography Stack

```css
font-family: "Manrope", "Inter", system-ui, -apple-system,
             BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

**Benefits:**
- Consistent rendering across all platforms
- Professional appearance
- Better readability
- Optimized letter-spacing and line-height

## Changes Applied

1. ✅ Downgraded Tailwind from v4 to v3.4.1
2. ✅ Updated `tailwind.config.ts` with 7Seers colors, fonts, animations
3. ✅ Replaced `index.css` with 7Seers typography and utilities
4. ✅ Updated Button component with new color variants
5. ✅ Added `cursor: pointer` to all buttons
6. ✅ Added `btn-press` animation to all buttons
7. ✅ Applied responsive font sizing
8. ✅ Added thin scrollbar styling
9. ✅ Applied blue text selection
10. ✅ Cross-platform font smoothing

## Testing

Visit **http://localhost:3000/** to see the new design system in action!

**What to check:**
- ✅ All buttons have proper colors (blue primary, teal secondary, coral destructive)
- ✅ All buttons have cursor pointer
- ✅ Hover effects work correctly
- ✅ Button press animation (scale down on click)
- ✅ Fonts render consistently
- ✅ Thin scrollbar appears
- ✅ Text selection is blue with white text

---

**Design system successfully applied!** 🎨
