# Capacity Connect - Frontend Client

Modern React + TypeScript single-page application built with Vite and Tailwind CSS for the Capacity Connect Digital Capacity Building and Learning Management Portal.

## Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # AppShell, Navbar, Footer
│   │   └── ui/           # Radix/CVA UI primitives (Button, Card, Badge)
│   ├── lib/              # Utility helpers (cn clsx/tailwind-merge)
│   ├── pages/            # View components (HomePage, LoginPage, HealthPage)
│   ├── services/         # API HTTP client & TanStack Query services
│   ├── store/            # Zustand global state (Role & UI simulator)
│   ├── App.tsx           # React Router & QueryClient provider configuration
│   ├── main.tsx          # Application mount entrypoint
│   └── index.css         # Tailwind CSS design system tokens
├── index.html            # HTML shell with accessibility metadata
├── vite.config.ts        # Vite configuration with @/* alias and Tailwind
├── tsconfig.json         # TypeScript project configuration
├── tsconfig.app.json     # App compiler options
└── package.json          # Node dependencies & scripts
```

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `VITE_API_BASE_URL` is `http://localhost:8000/api/v1`.

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).

### 4. Production Build
```bash
npm run build
```
Verify the build with:
```bash
npm run preview
```
