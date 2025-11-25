# Assets Directory

Example showing assets usage.

## Structure
```
assets/
├── README.md           # This file
├── logo.svg           # App logo
├── favicon.ico        # Browser icon
└── images/
    └── hero.jpg       # Homepage hero image
```

## In .compose File

```compose
feature "Branding":
  - App logo in navbar and footer
  - Favicon for browser tab

guide "Static Assets":
  - Logo: assets/logo.svg
  - Favicon: assets/favicon.ico
  - Hero image: assets/images/hero.jpg
```

## compose.json

Assets are automatically copied to framework output during `compose build`.

## Framework Output

- **Next.js**: → `public/`
- **Vite/React**: → `public/`
- **React Native**: → `assets/`
