# Nero Admin Panel

Modern admin panel built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- 🔐 Authentication pages
- 📊 Dashboard with statistics
- 👥 User management
- ⚙️ Settings page
- 🎯 Clean architecture with TypeScript

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Vite** - Build tool
- **Lucide React** - Icons
- **Zustand** - State management
- **Axios** - HTTP client

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server (runs on port 5175)
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

### Preview

```bash
# Preview production build
npm run preview
```

## Project Structure

```
panel/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── AdminLayout.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Available Routes

- `/login` - Login page
- `/` - Dashboard
- `/users` - User management
- `/settings` - Application settings

## Running from Root

You can also run the panel from the root directory:

```bash
# Install panel dependencies
npm run panel:install

# Start panel dev server
npm run panel:dev

# Build panel
npm run panel:build
```

## API Integration

The panel is configured to proxy API requests to `http://localhost:2000`. Update the proxy configuration in `vite.config.ts` if needed.

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Layout

The main layout is in `src/components/layout/AdminLayout.tsx`. Customize the sidebar, header, and navigation as needed.

## License

Private
