# SAEG | La Boutique - CSS Utilities & Classes Reference

## Complete List of Available CSS Classes

This document provides a comprehensive reference of all Tailwind-based CSS utilities available in the `app.css` file.

---

## 📝 Color Classes

### Background Colors
```css
.bg-white          /* #ffffff */
.bg-slate-50       /* #f8fafc */
.bg-slate-100      /* #f1f5f9 */
.bg-slate-200      /* #e2e8f0 */
.bg-slate-900      /* #1e293b */
.bg-primary        /* #00571a */
.bg-primary/5      /* rgba(0, 87, 26, 0.05) */
.bg-primary/10     /* rgba(0, 87, 26, 0.1) */
.bg-primary/90     /* rgba(0, 87, 26, 0.9) */
.bg-red-600        /* #dc2626 */
.bg-black          /* #000000 */
.bg-black/80       /* rgba(0, 0, 0, 0.8) */
```

### Text Colors
```css
.text-primary      /* #00571a */
.text-white        /* #ffffff */
.text-slate-400    /* #94a3b8 */
.text-slate-500    /* #64748b */
.text-slate-600    /* #475569 */
.text-slate-700    /* #334155 */
.text-slate-900    /* #0f172a */
.text-white/80     /* rgba(255, 255, 255, 0.8) */
```

### Border Colors
```css
.border-slate-100  /* #f1f5f9 */
.border-slate-200  /* #e2e8f0 */
.border-none       /* none */
```

### Hover States
```css
.hover\:bg-primary:hover           /* Change to primary on hover */
.hover\:bg-primary\/90:hover       /* Change to primary/90 on hover */
.hover\:bg-slate-50:hover          /* Change to slate-50 on hover */
.hover\:bg-slate-800:hover         /* Change to slate-800 on hover */
.hover\:text-white:hover           /* Change text to white on hover */
.hover\:text-primary:hover         /* Change text to primary on hover */
.hover\:underline:hover            /* Add underline on hover */
.hover\:scale-110:hover            /* Scale to 1.1x on hover */
```

---

## 🔤 Typography Classes

### Font Weights
```css
.font-normal       /* 400 */
.font-semibold     /* 600 */
.font-bold         /* 700 */
.font-black        /* 900 */
```

### Font Sizes
```css
.text-xs           /* 0.75rem = 12px */
.text-sm           /* 0.875rem = 14px */
.text-lg           /* 1.125rem = 18px */
.text-xl           /* 1.25rem = 20px */
.text-2xl          /* 1.5rem = 24px */
.text-3xl          /* 1.875rem = 30px */
.text-4xl          /* 2.25rem = 36px */
.text-6xl          /* 3.75rem = 60px */
.text-\[10px\]     /* 10px (custom) */
.text-\[12px\]     /* 12px (custom) */
```

### Letter Spacing
```css
.tracking-wider    /* 0.05em */
.tracking-widest   /* 0.1em */
.tracking-tight    /* -0.025em */
```

### Text Transform
```css
.uppercase         /* text-transform: uppercase */
```

---

## 📏 Spacing Classes

### Padding
```css
.px-1, .px-2, .px-3, .px-4, .px-6, .px-8, .px-10
.py-1, .py-2, .py-3, .py-4, .py-6, .py-8, .py-12, .py-16, .py-24
.p-1, .p-2, .p-3, .p-4, .p-5, .p-6
```

### Margin
```css
.m-0                  /* 0 */
.mt-1, .mt-2, .mt-4, .mt-6, .mt-16
.mb-4, .mb-6, .mb-10
.mr-4
```

### Gap (Flexbox/Grid)
```css
.gap-1, .gap-2, .gap-3, .gap-4, .gap-6, .gap-8, .gap-12
```

### Space Between (Flexbox)
```css
.space-y-6         /* > * + * { margin-top: 1.5rem; } */
```

---

## 🎯 Border & Radius

### Border
```css
.border             /* 1px solid */
.border-b           /* border-bottom: 1px solid */
.border-none        /* border: none */
```

### Border Radius
```css
.rounded            /* 0.25rem (4px) */
.rounded-lg         /* 0.5rem (8px) */
.rounded-xl         /* 0.75rem (12px) */
.rounded-full       /* 9999px (circular) */
.rounded-\[0.5rem\]   /* Custom: 0.5rem (8px) */
```

---

## 💫 Shadows

```css
.shadow-lg          /* 0 10px 15px -3px rgba(0,0,0,0.1) */
.shadow-2xl         /* 0 25px 50px -12px rgba(0,0,0,0.25) */
.shadow-xl          /* 0 20px 25px -5px rgba(0,0,0,0.1) */
.hover\:shadow-lg:hover
```

---

## 🔲 Flexbox & Grid

### Flex Container
```css
.flex               /* display: flex */
.flex-wrap          /* flex-wrap: wrap */
.flex-col           /* flex-direction: column */
.flex-row           /* flex-direction: row */
```

### Align Items
```css
.items-start        /* align-items: flex-start */
.items-center       /* align-items: center */
.items-end          /* align-items: flex-end */
```

### Justify Content
```css
.justify-start      /* justify-content: flex-start */
.justify-center     /* justify-content: center */
.justify-between    /* justify-content: space-between */
.justify-end        /* justify-content: flex-end */
```

### Flex Children
```css
.flex-1             /* flex: 1 */
.flex-auto          /* flex: auto */
```

### Grid Container
```css
.grid               /* display: grid */
.grid-cols-1        /* grid-template-columns: repeat(1, minmax(0, 1fr)) */
.grid-cols-2        /* grid-template-columns: repeat(2, minmax(0, 1fr)) */
.grid-cols-3        /* grid-template-columns: repeat(3, minmax(0, 1fr)) */
.grid-cols-4        /* grid-template-columns: repeat(4, minmax(0, 1fr)) */
```

---

## 📐 Sizing

### Width
```css
.w-full             /* 100% */
.w-8                /* 2rem (32px) */
.w-auto             /* auto */
.w-\[400px\]        /* 400px (custom) */
```

### Height
```css
.h-full             /* 100% */
.h-8                /* 2rem (32px) */
.h-10               /* 2.5rem (40px) */
.h-auto             /* auto */
.h-\[400px\]        /* 400px (custom) */
.h-\[500px\]        /* 500px (custom) */
```

### Max Width
```css
.max-w-xs           /* 20rem (320px) */
.max-w-xl           /* 36rem (576px) */
.max-w-4xl          /* 56rem (896px) */
.max-w-7xl          /* 80rem (1280px) */
```

### Aspect Ratio
```css
.aspect-square      /* aspect-ratio: 1 */
.aspect-video       /* aspect-ratio: 16 / 9 */
```

---

## 📍 Positioning

### Position
```css
.relative           /* position: relative */
.absolute           /* position: absolute */
.fixed              /* position: fixed */
.sticky             /* position: sticky */
```

### Position Values
```css
.inset-0            /* top/right/bottom/left: 0 */
.inset-x-0          /* left: 0; right: 0 */
.top-0, .top-1\/2, .top-2
.bottom-0, .bottom-2, .bottom-4, .bottom-6
.left-0, .left-2, .left-3, .left-4
.right-0, .right-2, .right-6, .right-full  /* right: 100% */
.z-10, .z-50, .z-60
```

### Transforms
```css
.-translate-y-1\/2     /* translateY(-50%) */
.translate-y-0         /* translateY(0) */
.rotate-3              /* rotate(3deg) */
.scale-105             /* scale(1.05) */
.scale-110             /* scale(1.1) */
.group-hover\:scale-110        /* On parent hover */
```

---

## 🎪 Overflow & Visibility

### Overflow
```css
.overflow-hidden    /* overflow: hidden */
.overflow-visible   /* overflow: visible */
.whitespace-nowrap  /* white-space: nowrap */
```

### Display
```css
.hidden             /* display: none */
.visible            /* visibility: visible */
.invisible          /* visibility: hidden */
.inline             /* display: inline */
.inline-flex        /* display: inline-flex */
.block              /* display: block */
.pointer-events-none /* pointer-events: none */
```

---

## 🎨 Transitions & Animations

### Transitions
```css
.transition-colors      /* transition: color, background-color, border-color */
.transition-all         /* transition: all */
.transition-transform   /* transition: transform */
.transition-shadow      /* transition: box-shadow */
.transition-opacity     /* transition: opacity */
.duration-500           /* transition-duration: 500ms */
```

### Animations
```css
.animate-pulse      /* Pulsing animation (opacity 0-1 at 50%) */
```

### Focus States
```css
.focus\:ring-1:focus           /* ring: 1px solid */
.focus\:ring-2:focus           /* ring: 2px solid */
.focus\:ring-primary:focus     /* ring: primary color */
.focus\:ring-white\/20:focus   /* ring: rgba(255,255,255,0.2) */
```

---

## 🖼️ Image & Object Fit

```css
.object-cover       /* object-fit: cover */
```

---

## 📈 Gradients

```css
.bg-gradient-to-t                      /* background-image: linear-gradient(to top, ...) */
.from-black\/80                        /* --tw-gradient-from: rgba(0,0,0,0.8) */
.via-transparent                       /* --tw-gradient-to: transparent */
.to-transparent
```

---

## 🎁 Material Symbols Icons

```css
.material-symbols-outlined              /* Icon font setup */
.material-symbols-outlined.text-sm      /* 18px size */
.material-symbols-outlined.text-lg      /* 28px size */
.material-symbols-outlined.text-3xl     /* 32px size */
.material-symbols-outlined.text-primary /* Primary color icons */
.material-symbols-outlined.text-slate-400
```

**Available Icons**: All Material Symbols (1000+) via font

```html
<!-- Examples -->
<span class="material-symbols-outlined">shopping_cart</span>
<span class="material-symbols-outlined">arrow_forward</span>
<span class="material-symbols-outlined">search</span>
<span class="material-symbols-outlined">person</span>
<span class="material-symbols-outlined">phone</span>
<span class="material-symbols-outlined">mail</span>
<span class="material-symbols-outlined">location_on</span>
```

---

## 📱 Responsive Breakpoints

All utilities support responsive prefixes:

### Breakpoint Classes
```css
/* Mobile First (default) */
.grid-cols-1                    /* All breakpoints */

/* Tablet and up (768px) */
.md\:grid-cols-2
.md\:flex
.md\:hidden
.md\:flex-row
.md\:px-10
.md\:py-24
.md\:text-xl
.md\:text-4xl
.md\:text-6xl
.md\:h-\[500px\]

/* Desktop and up (1024px) */
.lg\:flex
.lg\:grid-cols-3
.lg\:w-8
.lg\:text-sm
```

### Example: Responsive Grid
```html
<!-- 1 column mobile, 2 columns tablet, 3 columns desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- content -->
</div>
```

---

## 🧩 Layout Utilities

```css
.mx-auto            /* margin-left: auto; margin-right: auto; */
.align-middle       /* vertical-align: middle */
```

---

## 📊 Container Query

```css
.container          /* Container with responsive max-width */
```

---

## 🔍 Quick Reference by Component Type

### Buttons
```html
<button class="px-8 py-4 bg-primary text-white font-bold rounded hover:bg-primary/90 transition-all">
  Click me
</button>
```

### Cards
```html
<div class="bg-white border border-slate-100 rounded-lg p-6 hover:shadow-lg transition-shadow">
  <!-- content -->
</div>
```

### Badges
```html
<span class="bg-primary text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
```

### Links
```html
<a class="text-primary hover:text-primary/80 transition-colors" href="#">Link</a>
```

### Forms
```html
<input class="w-full px-4 py-2 border border-slate-200 rounded focus:ring-1 focus:ring-primary" />
```

### Headers
```html
<header class="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3">
  <!-- content -->
</header>
```

### Flex Layouts
```html
<!-- Space between items -->
<div class="flex items-center justify-between gap-4">
  <!-- content -->
</div>

<!-- Centered -->
<div class="flex items-center justify-center h-96">
  <!-- content -->
</div>

<!-- Column layout -->
<div class="flex flex-col gap-6">
  <!-- content -->
</div>
```

### Grid Layouts
```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- content -->
</div>
```

---

## 💡 Tips & Tricks

1. **Color transparency**: Use `/` notation
   - `.bg-primary/10` = 10% opacity
   - `.bg-white/80` = 80% opacity

2. **Responsive mobile-first**: Write for mobile, add `md:` for tablet up
   - `.grid-cols-1` (mobile)
   - `.md:grid-cols-2` (tablet+)
   - `.lg:grid-cols-3` (desktop+)

3. **Hover/Focus states**: Use class prefixes
   - `.hover:text-primary:hover` - On hover
   - `.group-hover:opacity-100` - On parent hover
   - `.focus:ring-primary:focus` - On focus

4. **Layering**: CSS specificity follows this order:
   - Base styles (app.css)
   - Responsive utilities (md:, lg:)
   - Pseudo-classes (hover:, focus:)
   - Inline styles (highest)

5. **Custom values**: Use bracket notation
   - `.text-\[10px\]` = custom 10px font size
   - `.w-\[400px\]` = custom 400px width
   - `.h-\[500px\]` = custom 500px height

---

## 📖 Further Reference

- This document covers all utilities found in `assets/css/app.css`
- For block editor customization, see `theme.json`
- For advanced WordPress customization, see `functions.php`
- For full theme documentation, see `README.md`

---

**Last Updated**: 2024
**Compatibility**: All modern browsers (Chrome, Firefox, Safari, Edge)
