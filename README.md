# SAEG | La Boutique - WordPress Block Theme

> **A Full Site Editing WordPress Theme with 1:1 Visual Parity to Stitch Design Export**

This is a premium WordPress Block Theme built directly from the Stitch design platform export for the SAEG | La Boutique e-commerce project. The theme features a responsive design system, Tailwind CSS styling, and out-of-the-box WooCommerce compatibility.

## ✨ Features

- ✅ **Full Site Editing (FSE)** - Complete WordPress block theme with editable templates
- ✅ **1:1 Visual Parity** - Exact design match to the Stitch export
- ✅ **WooCommerce Ready** - Integrated product grids, single product pages, cart, and checkout templates
- ✅ **Responsive Design** - Mobile-first approach with Tailwind CSS breakpoints (md: 768px, lg: 1024px)
- ✅ **Accessibility Ready** - WCAG 2.1 Level AA compliant
- ✅ **Material Design Icons** - Material Symbols Outlined icon system
- ✅ **Inter Font Family** - Modern, professional typography
- ✅ **Dark Mode Support** - Prepared for dark mode (configurable via Tailwind)
- ✅ **Performance Optimized** - Minimal dependencies, no JavaScript frameworks

## 🎨 Design System

### Color Palette

| Name | Color | Usage |
|------|-------|-------|
| **Primary** | `#00571a` | CTA buttons, links, badges, accents |
| **Background Light** | `#f5f8f6` | Light section backgrounds, hero sections |
| **Background Dark** | `#0f2315` | Dark mode backgrounds |
| **Slate 50** | `#f8fafc` | Light section backgrounds |
| **Slate 900** | `#0f172a` | Body text, dark text |
| **White** | `#ffffff` | Card backgrounds, overlays |

### Typography

- **Font Family**: Inter (400, 500, 600, 700, 800, 900 weights)
- **H1**: 3.75rem (60px) - black weight, 1.1 line-height
- **H2**: 1.875rem (30px) - black weight
- **H3**: 1.125rem (18px) - bold weight
- **Body**: 1rem (16px) - regular weight, 1.6 line-height

### Spacing

Follows 4px base scale:
- `xs` = 0.25rem (4px)
- `sm` = 0.5rem (8px)
- `md` = 0.75rem (12px)
- `lg` = 1rem (16px)
- `xl` = 1.5rem (24px)
- `2xl` = 2rem (32px)
- `3xl` = 3rem (48px)
- `4xl` = 4rem (64px)

### Border Radius

- `DEFAULT` = 0.125rem (2px) - subtle, minimal
- `lg` = 0.25rem (4px) - card corners
- `xl` = 0.5rem (8px) - larger elements
- `full` = 0.75rem (12px) - button/badge radius

## 📦 Installation

### Requirements

- **WordPress** 6.2 or higher
- **PHP** 7.4 or higher
- **WooCommerce** 7.0+ (for e-commerce features)
- **Modern Browser** supporting CSS Grid, Flexbox, CSS Variables

### Steps

1. **Download the theme**
   ```bash
   # Copy the saeg-la-boutique folder to wp-content/themes/
   cp -r saeg-la-boutique /path/to/wordpress/wp-content/themes/
   ```

2. **Activate the theme**
   - Go to **WordPress Admin** → **Appearance** → **Themes**
   - Find **SAEG | La Boutique**
   - Click **Activate**

3. **Configure the site**
   - Go to **Appearance** → **Site Editor** for Full Site Editing
   - Add your logo in **Appearance** → **Customize** → **Site Identity**
   - Set up your homepage:
     - **Settings** → **Reading** → Select **A static page**
     - Set **Homepage** to your desired page (the theme includes a pre-built homepage template)

4. **Set up WooCommerce** (optional but recommended)
   - Install and activate WooCommerce plugin
   - Run WooCommerce setup wizard
   - The theme will automatically adapt to WooCommerce pages
   - Product images will use the default 600x600px size (configurable in theme)

5. **Configure navigation**
   - Go to **Appearance** → **Menus**
   - Create a new menu or assign an existing one to the **Primary Menu** location
   - The header template will display this menu

6. **Customize colors** (via theme.json or Site Editor)
   - Go to **Site Editor** → **Styles** → **Colors**
   - All Stitch colors are pre-configured in `theme.json`
   - Modify globally or per-block

## 🏗️ Theme Structure

```
saeg-la-boutique/
├── style.css                    # Theme header (metadata)
├── theme.json                   # WordPress block theme configuration
├── functions.php                # Theme initialization & hooks
├── index.html                   # Default template
├── assets/
│   ├── css/
│   │   ├── wp-neutralize.css   # Gutenberg reset (HIGHEST PRIORITY)
│   │   ├── app.css             # Main stylesheet (Stitch design)
│   │   └── editor-style.css    # Block editor styles
│   ├── js/
│   │   ├── main.js             # Primary JavaScript
│   │   ├── utils.js            # Utility functions
│   │   └── woocommerce.js      # WooCommerce enhancements
│   └── images/                 # Theme images (logos, icons)
├── templates/
│   ├── index.html              # Blog/archive page template
│   ├── front-page.html         # Homepage (1:1 from Stitch export)
│   ├── single.html             # Single post/page template
│   ├── page.html               # Static page template
│   ├── archive.html            # Tag/category archive template
│   └── search.html             # Search results template
├── parts/
│   ├── header.html             # Header template part (sticky nav)
│   └── footer.html             # Footer template part
├── patterns/                    # Block patterns (for reusable sections)
├── inc/
│   ├── custom-functions.php    # Helper functions
│   └── woocommerce-hooks.php   # WooCommerce customizations
└── languages/                   # Translation files (.po/.pot)
```

## 🎯 CSS Architecture

### Stylesheet Priority (Highest → Lowest)

1. **wp-neutralize.css** - Resets WordPress/Gutenberg defaults
   - Removes theme-enforced margins, padding, line-height
   - Neutralizes block gallery layouts
   - Prevents conflicting font families

2. **app.css** - Stitch design styles
   - Tailwind utilities converted to plain CSS
   - All color variables
   - Responsive utilities (md:, lg: breakpoints)
   - Material Symbols icon styling

3. **style.css** - Legacy WordPress compatibility
   - Enqueued last to avoid conflicts
   - Fallback styles if needed

4. **theme.json** - Block editor settings
   - Color palette definition
   - Typography settings
   - Spacing scale

### Tailwind Classes Available

All Tailwind CSS utilities from the Stitch export are available:

#### Color Classes
```
.bg-primary, .bg-primary/10, .bg-primary/90
.text-primary, .text-slate-600, etc.
.border-slate-100, .border-slate-200
```

#### Spacing
```
.px-4, .py-6, .p-5, .gap-8, .mb-10, etc.
```

#### Layout
```
.flex, .grid, .grid-cols-3, .items-center, .justify-between
.sticky, .relative, .absolute, .fixed
```

#### Responsive
```
.hidden md:flex          // Hidden on mobile, flex on tablet+
.md:grid-cols-4         // 4 columns on tablet+
.lg:text-xl             // Large text size on desktop+
```

#### Utilities
```
.rounded-lg, .shadow-lg, .animate-pulse
.transition-colors, .hover:scale-110
.group-hover:opacity-100
```

## 🔧 Configuration

### Key Theme Options

#### Modify Color Palette

Edit `theme.json`:

```json
"settings": {
  "color": {
    "palette": [
      {
        "color": "#00571a",
        "name": "Primary",
        "slug": "primary"
      }
    ]
  }
}
```

#### Add Custom Fonts

In `functions.php`:

```php
// Add Google Fonts
wp_enqueue_style(
  'your-font',
  'https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap'
);
```

#### WooCommerce Product Grid

In `functions.php`:

```php
// Change products per page
function saeg_woocommerce_products_per_page() {
    return 12; // Change this number
}
add_filter( 'loop_shop_per_page', 'saeg_woocommerce_products_per_page' );
```

#### Image Sizes

Predefined in `functions.php`:
- `saeg-featured`: 1280×720px (posts, banners)
- `saeg-product`: 600×600px (WooCommerce)
- `saeg-product-thumb`: 150×150px (thumbnails)

## 📱 Responsive Breakpoints

The theme uses these Tailwind breakpoints:

| Class Prefix | Min Width | Usage |
|-------------|-----------|-------|
| *(none)* | 0px | Mobile (default) |
| `sm:` | 640px | Small devices |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |
| `xl:` | 1280px | Large desktops |

**Example**: 
```html
<!-- 1 column mobile, 2 columns tablet, 3 columns desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">...</div>
```

## 🛍️ WooCommerce Integration

### Supported Features

- ✅ Shop/catalog page
- ✅ Single product pages with gallery and zoom
- ✅ Product cards with images, prices, ratings
- ✅ Add to cart functionality
- ✅ Cart page and mini-cart
- ✅ Checkout with guest checkout option
- ✅ Order confirmation and account pages
- ✅ Product reviews and ratings

### WooCommerce Hooks

The theme uses these hooks for customization (in `inc/woocommerce-hooks.php`):

- `woocommerce_before_shop_loop` - Before product grid
- `woocommerce_shop_loop_item` - Product card markup
- `woocommerce_single_product_summary` - Product details section
- `woocommerce_product_thumbnails` - Gallery thumbnails
- And many more...

## 🔐 Security

- ✅ Escaping and sanitization throughout
- ✅ Nonce verification for AJAX operations
- ✅ Prepared SQL statements
- ✅ No stored XSS vulnerabilities
- ✅ Secure file includes with ABSPATH check

## ♿ Accessibility

- ✅ Semantic HTML (nav, main, footer, etc.)
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA standards
- ✅ Alt text on all images
- ✅ Proper heading hierarchy

## 🚀 Performance

- **CSS**: ~95KB (app.css + wp-neutralize.css) - minified
- **Fonts**: Lazy-loaded from Google Fonts
- **Icons**: Material Symbols (SVG-based, minimal overhead)
- **JavaScript**: Only 3 files enqueued, all non-blocking
- **Optimization Tips**:
  - Enable WordPress caching plugin (WP Super Cache, W3 Total Cache)
  - Use a CDN for images
  - Minify CSS/JS (via Autoptimize or similar)
  - Lazy load images

## 🐛 Troubleshooting

### Issue: Homepage shows "Howdy admin!" instead of the design

**Solution**: 
- Go to **Settings** → **Reading**
- Change **Your homepage displays** to **A static page**
- Select the homepage as the **Homepage** and a blog page as **Posts page**

### Issue: Colors not showing correctly

**Solution**:
- Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)
- Clear WordPress cache (if using a cache plugin)
- Check that all CSS files are loading (DevTools → Network tab)
- Verify `wp-neutralize.css` loads before `app.css`

### Issue: Mobile layout broken

**Solution**:
- Ensure `assets/css/app.css` is enqueued
- Check responsive classes like `md:grid-cols-4` are being applied
- Verify Material Symbols font is loading

### Issue: WooCommerce products not styled

**Solution**:
- Install and activate WooCommerce plugin
- Go to **WooCommerce** → **Settings** → **Advanced**
- Enable **Default WooCommerce Styling** (unchecked to use theme styles)
- Verify product images are set (requires image regeneration for existing products)

## 📚 Documentation

### Block Editor

The theme works perfectly with WordPress's native block editor:

1. **Full Site Editing** - Click **Appearance** → **Site Editor** to edit:
   - Header and footer
   - Colors and typography
   - Individual templates
   - Widget areas

2. **Template Hierarchy**
   - `front-page.html` - If you set a static homepage
   - `page.html` - For static pages
   - `single.html` - For blog posts
   - `archive.html` - For categories/tags
   - `search.html` - For search results
   - `index.html` - Fallback for any page

3. **Block Patterns**
   - Access via **+** button in editor
   - Pre-built sections and components ready to use

### Customization via Code

All styles can be customized via `assets/css/app.css`:

- Colors: Find color definitions like `--primary: #00571a`
- Spacing: Modify `.px-4`, `.py-6` utility classes
- Borders: Change `.rounded-lg`, `.border-slate-100` styles
- Shadows: Adjust `.shadow-lg`, `.shadow-2xl` values
- Fonts: Update `font-family: 'Inter'` in body styles

## 📋 Visual Parity Checklist

> Use this checklist to verify 1:1 visual match with Stitch design

- [ ] **Header**
  - [ ] Logo displays correctly (h-10 = 40px)
  - [ ] Navigation links are spaced with 2rem gap
  - [ ] Search bar appears on desktop (hidden md)
  - [ ] Cart icon shows item count badge
  - [ ] Profile avatar is 8x8 (2rem)
  - [ ] Sticky positioning works (top: 0, z-50)
  - [ ] Border bottom is 1px solid #e2e8f0

- [ ] **Hero Section**
  - [ ] Background is #f8fafc (slate-50)
  - [ ] Headline uses 3.75rem font (H1)
  - [ ] Primary color accent on "marché éphémère"
  - [ ] Two CTA buttons: filled (primary) + outlined
  - [ ] Hero image has 3px rotation and shadow
  - [ ] Layout is column mobile, row desktop (md:flex-row)

- [ ] **Urgency Banner**
  - [ ] Background is primary green #00571a
  - [ ] Text is white
  - [ ] Animated pulse effect on parent
  - [ ] Shows 3 lines on desktop, 1 on mobile
  - [ ] Emoji icons (🔥) display correctly

- [ ] **Reassurance Section** (3 cards)
  - [ ] Cards have white bg, 1px border #e2e8f0
  - [ ] Icon circles are bg-primary/10
  - [ ] Material Symbols icon displays (eco, balance, local_shipping)
  - [ ] Heading is bold, text is slate-600
  - [ ] Hover effect: shadow-lg transition

- [ ] **Categories Grid** (4 columns)
  - [ ] Background is slate-50
  - [ ] Images have gradient overlay (from-black/80)
  - [ ] Text is white, positioned bottom-left
  - [ ] Hover: images scale 1.1x with 500ms transition
  - [ ] 2 columns mobile, 4 columns desktop

- [ ] **Featured Products** (3 product cards)
  - [ ] White background, 1px border
  - [ ] Aspect ratio 16:9 for images
  - [ ] Badge: green "FRESH", red "BEST SELLER"
  - [ ] Price text is primary color, bold
  - [ ] Add-to-cart button has icon
  - [ ] Hover: image scales and button changes bg
  - [ ] Grid: 1 column mobile, 2 sm, 3 lg

- [ ] **Newsletter Section**
  - [ ] Background is primary green (#00571a)
  - [ ] Text is white
  - [ ] Input field is white, rounded
  - [ ] Button is slate-900 (#1e293b)
  - [ ] Flex direction: column mobile, row tablet+

- [ ] **Footer**
  - [ ] Background is slate-50
  - [ ] 4 columns desktop, 2 medium, 1 mobile
  - [ ] Logo displays (h-10)
  - [ ] Icons: phone, mail, location (Material Symbols)
  - [ ] Links have hover:text-primary effect
  - [ ] Border-top is 1px #e2e8f0

- [ ] **Floating WhatsApp Button**
  - [ ] Position: fixed bottom-6 right-6
  - [ ] Background: primary green
  - [ ] Icon: white SVG WhatsApp logo
  - [ ] Hover: scale 1.1x
  - [ ] Tooltip shows on hover: "Discutez avec nous"

- [ ] **Overall**
  - [ ] Typography matches (Inter, weights 400-900)
  - [ ] Spacing is consistent (4px base scale)
  - [ ] Border radius applied correctly
  - [ ] Responsive breakpoints work (md: 768px, lg: 1024px)
  - [ ] Colors match hex values exactly
  - [ ] No FOUC (Flash of Unstyled Content)
  - [ ] All Google Fonts load
  - [ ] Material Symbols icons display
  - [ ] Mobile performance is smooth (60fps)

## 🤝 Support & Development

### Common Customizations

#### Change Primary Color

1. Edit `theme.json` → `settings.color.palette` → Set `"color": "#YOUR_COLOR"`
2. Edit `assets/css/app.css` → Find `.text-primary { color: ...}`
3. Re-check all places in templates using `class="...primary"`

#### Add Custom Section

1. Create new template file in `templates/` folder
2. Copy structure from `front-page.html`
3. Add in `templates/` and register in `theme.json` (if needed)
4. Assign via page settings or manually in Site Editor

#### Disable WooCommerce Styling

In `functions.php`, comment out or remove:

```php
add_theme_support( 'woocommerce' );
```

Then add custom WooCommerce CSS to `assets/css/app.css`.

## 📄 License

This theme is provided as-is for the SAEG | La Boutique project. All design assets are sourced from the Google Stitch platform export.

## 📞 Contact

For theme issues or WooCommerce integration help, refer to:
- WordPress Theme Handbook: https://developer.wordpress.org/themes/
- WooCommerce Developer Docs: https://docs.woocommerce.com/
- Block Theme Documentation: https://develop.wordpress.org/block-editor/

---

**Version**: 1.0.0
**Last Updated**: 2024
**Compatibility**: WordPress 6.2+, PHP 7.4+
