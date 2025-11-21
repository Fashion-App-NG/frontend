#!/bin/bash
# filepath: scripts/generate-logo-assets.sh

# Create output directory
mkdir -p public/assets/logos

# Source files (after extraction above)
FULL_LOGO="public/assets/faari-logo-full-transparent.png"
ICON_ONLY="public/assets/faari-icon-only.png"
TEXT_ONLY="public/assets/faari-text-only.png"

echo "🎨 Generating Fáàrí logo assets..."

# ========================================
# FULL LOGO (Icon + Text) - For headers/footers
# ========================================

# Large - Hero sections, landing pages
magick "$FULL_LOGO" -resize 400x400 -gravity center -extent 400x400 \
  public/assets/logos/faari-full-lg.png

# Medium - Header, navigation
magick "$FULL_LOGO" -resize 200x200 -gravity center -extent 200x200 \
  public/assets/logos/faari-full-md.png

# Small - Mobile header, compact views
magick "$FULL_LOGO" -resize 120x120 -gravity center -extent 120x120 \
  public/assets/logos/faari-full-sm.png

# Extra small - Breadcrumbs, tight spaces
magick "$FULL_LOGO" -resize 80x80 -gravity center -extent 80x80 \
  public/assets/logos/faari-full-xs.png

# ========================================
# ICON ONLY (Dress icon) - For favicons, compact sidebars
# ========================================

# Large - Sidebar headers
magick "$ICON_ONLY" -resize 80x80 public/assets/logos/faari-icon-lg.png

# Medium - Default icon use
magick "$ICON_ONLY" -resize 48x48 public/assets/logos/faari-icon-md.png

# Small - Compact mode
magick "$ICON_ONLY" -resize 32x32 public/assets/logos/faari-icon-sm.png

# Favicon sizes
magick "$ICON_ONLY" -resize 64x64 public/assets/logos/faari-icon-64.png
magick "$ICON_ONLY" -resize 32x32 public/assets/logos/faari-icon-32.png
magick "$ICON_ONLY" -resize 16x16 public/assets/logos/faari-icon-16.png

# ========================================
# RETINA (@2x) versions
# ========================================

magick "$FULL_LOGO" -resize 400x400 public/assets/logos/faari-full-md@2x.png
magick "$FULL_LOGO" -resize 240x240 public/assets/logos/faari-full-sm@2x.png
magick "$ICON_ONLY" -resize 96x96 public/assets/logos/faari-icon-md@2x.png

# ========================================
# HERO IMAGE for User Type Selection
# ========================================

# Create a centered version on turquoise background for hero section
magick -size 1200x1200 xc:"#7DD3C0" \
  \( "$FULL_LOGO" -resize 600x600 \) \
  -gravity center -composite \
  public/assets/logos/faari-hero-bg.png

echo "✅ Logo assets generated successfully!"
echo ""
echo "Generated files:"
ls -lh public/assets/logos/