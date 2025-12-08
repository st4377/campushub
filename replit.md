# Campus Communities Hub

## Overview
Campus Communities Hub is a web application designed to connect college students with various campus communities (WhatsApp, Telegram, Discord, Instagram) similar to Disboard.org. It serves as a central directory for students to discover study groups, clubs, and interest-based groups. Users can browse communities without authentication, but listing a community requires registration and login. The application features a modern, dark-themed interface with yellow/orange accents, aiming to provide a comprehensive and user-friendly platform for college community discovery.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, using **Vite** for tooling. **Wouter** handles client-side routing, and **TanStack Query** manages server state. The UI is built using **shadcn/ui** with Radix UI primitives and styled with **Tailwind CSS v4**, featuring a dark theme with yellow/orange primary colors and custom fonts (Outfit, Space Grotesk). It employs component composition, custom hooks, **React Hook Form** with **Zod** for forms, and a mobile-first responsive design.

### Backend Architecture
The backend uses **Express.js** with **Node.js** and **TypeScript**, providing a RESTful API with `/api` prefixing. It uses a clean data layer abstraction with an `IStorage` interface, currently implemented with `MemStorage` for development, but designed for a **PostgreSQL** database via **Drizzle ORM**. The server is bundled with esbuild for production, while development uses concurrent processes with HMR and auto-restart.

### Database Schema
The application uses **Drizzle ORM** with **PostgreSQL** (Neon serverless driver). The schema includes a `Users` table for authentication with `id`, `fullName`, `email` (unique), `password` (hashed), and `createdAt`. Primary keys use `gen_random_uuid()` and Zod schemas are derived for runtime validation.

### Authentication & Authorization
The system supports user registration and login with email uniqueness, password hashing (bcrypt), and session-based authentication using `express-session` and `connect-pg-simple`. Users must be logged in to list or manage communities. Admins have additional privileges for managing submissions, including pinning, editing, and rejecting communities with reasons.

### Build & Deployment
The build process uses Vite for the client (to `dist/public`) and esbuild for the server (to `dist/index.cjs`). Development involves concurrent client and server processes with hot module replacement and server auto-restarts. Replit-specific optimizations include custom Vite plugins for the Replit environment.

## External Dependencies

### Core Framework Dependencies
-   **@neondatabase/serverless**: PostgreSQL driver
-   **drizzle-orm**, **drizzle-zod**: ORM and schema validation
-   **express**: Web server framework
-   **react**, **react-dom**: UI framework
-   **vite**: Build tool
-   **wouter**: React router
-   **@tanstack/react-query**: Server state management

### UI Component Libraries
-   **@radix-ui/***: Headless UI primitives
-   **lucide-react**: Icon library
-   **tailwindcss**: CSS framework
-   **shadcn/ui**: UI component library
-   **class-variance-authority**: Component variant management
-   **cmdk**: Command menu component

### Form & Validation
-   **react-hook-form**: Form state management
-   **@hookform/resolvers**: Form validation integration
-   **zod**: Schema validation

### Session Management
-   **express-session**: Session middleware
-   **connect-pg-simple**: PostgreSQL session store

### Development Tools
-   **typescript**: Type system
-   **tsx**: TypeScript execution
-   **esbuild**: JavaScript bundler
-   **@replit/vite-plugin-***: Replit-specific plugins