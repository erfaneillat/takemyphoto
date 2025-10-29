# Nero - React TypeScript Application

A modern React application built with TypeScript, Tailwind CSS, and following clean architecture principles.

## 🚀 Features

- **React 18** - Latest version with modern hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **i18next** - Internationalization support (English & Persian)
- **Clean Architecture** - Well-organized folder structure
- **Lucide Icons** - Beautiful icon set

## 📁 Project Structure

```
src/
├── core/                    # Core business logic
│   ├── domain/             # Domain layer
│   │   ├── entities/       # Business entities
│   │   ├── repositories/   # Repository interfaces
│   │   └── usecases/       # Business use cases
│   └── data/               # Data layer
│       ├── datasources/    # Data sources
│       ├── models/         # Data models
│       └── repositories/   # Repository implementations
├── features/               # Feature modules
├── shared/                 # Shared resources
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   ├── translations/       # i18n translations
│   └── utils/              # Utility functions
├── App.tsx                 # Main app component
└── main.tsx               # App entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 🌍 Internationalization

The application supports multiple languages (English and Persian). To add new translations:

1. Add new keys to `src/shared/translations/en.json` and `src/shared/translations/fa.json`
2. Use the `useTranslation` hook in your components:

```tsx
import { useTranslation } from '@/shared/hooks';

const { t, changeLanguage } = useTranslation();
const text = t('common.welcome');
```

## 🎨 Styling

The project uses Tailwind CSS for styling. Custom theme colors can be configured in `tailwind.config.js`.

## 📦 State Management

State management is handled by Zustand. Create new stores in `src/shared/store/` following the pattern in `appStore.ts`.

## 🧩 Components

Reusable components are located in `src/shared/components/`. All components are built with TypeScript and Tailwind CSS.

## 📝 License

MIT
