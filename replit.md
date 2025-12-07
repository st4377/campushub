# Campus Communities Hub

## Overview

Campus Communities Hub is a web application designed to connect college students with various campus communities across different platforms (WhatsApp, Telegram, Discord, Instagram). The application functions similar to Disboard.org but specifically for college communities. Users can browse and search communities without authentication, while listing a community requires user registration and login.

The application features a modern, dark-themed interface with yellow/orange accent colors, inspired by platforms like Studique and Disboard. It provides a central directory for students to discover study groups, clubs, social communities, and interest-based groups within their college ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest Session)

### Completed Features
1. **Login Page Updates**
   - Removed "Join thousands of students..." text from left panel
   - Repositioned purple rectangle character closer to orange blob for better overlap
   - Added decorative grid lines and dots to right side (black background)
   - Updated logo colors to yellow/gold and white for visibility on black background

2. **Home Page - Filter Functionality**
   - Implemented fully functional filter system with state management
   - Filters for: Visibility (Public/Boys Only/Girls Only), Platform (WhatsApp/Telegram/Discord/Instagram), Categories
   - Removed Campus section filters (SRM KTR, SRM RMP, SRM VDP)
   - Reset Filters button appears when any filter is active
   - Community grid updates instantly when filters are applied
   - Multiple filters can be combined for refined results

3. **List Community Page - Submission Flow**
   - Added centered confirmation dialog before submission
   - Dialog asks for yes/no confirmation
   - After confirmation, shows success page with "Community Submitted!" message
   - Success page displays "Your request has been submitted for approval" with "pending review" status
   - Button to return to home after successful submission

4. **Dialog/Modal Animations**
   - Community detail cards pop from center (scale-based animation)
   - No slide animations - pure center pop-in/pop-out effect
   - Used for all modals and popups

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React Router alternative)
- **TanStack Query (React Query)** for server state management and data fetching

**UI Component System**
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS v4** for styling with custom design tokens
- **Custom theme**: Yellow/orange primary colors (#FFB700, #FF8C00) with dark backgrounds
- Uses "New York" style variant of shadcn components
- Custom fonts: Outfit (sans-serif) and Space Grotesk (headings)

**State Management Strategy**
- React Query handles server state, caching, and data synchronization
- Local component state with React hooks for UI interactions
- No global state management library (Redux/Zustand) - keeps architecture simple

**Key Design Patterns**
- Component composition with shadcn/ui primitives
- Custom hooks for reusable logic (`use-mobile`, `use-toast`)
- Form handling with React Hook Form + Zod validation
- Responsive design with mobile-first approach

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js
- TypeScript throughout the codebase
- HTTP server created with Node's built-in `http` module

**API Structure**
- RESTful API design with all routes prefixed with `/api`
- Routes registered through a centralized `registerRoutes` function
- Request/response logging middleware for debugging
- JSON body parsing with raw body preservation for webhooks

**Data Layer Abstraction**
- Storage interface (`IStorage`) provides CRUD operations
- Currently implements `MemStorage` (in-memory storage) for development
- Designed to be swapped with database implementation (Drizzle ORM ready)
- Clean separation between business logic and data persistence

**Development vs Production**
- Development mode uses Vite middleware for HMR and client serving
- Production mode serves pre-built static files from `dist/public`
- Single-file server bundle created with esbuild for fast cold starts
- Selective dependency bundling to reduce syscalls

### Database Schema (Drizzle ORM)

**ORM Choice: Drizzle with PostgreSQL**
- Drizzle Kit configured for PostgreSQL dialect
- Schema-first approach with TypeScript type inference
- Migrations stored in `./migrations` directory
- Uses Neon serverless PostgreSQL driver

**Current Schema**
- **Users table**: Basic authentication structure with id, username, password
- Uses PostgreSQL's `gen_random_uuid()` for primary keys
- Zod schemas derived from Drizzle tables for runtime validation

**Design Considerations**
- Schema lives in `shared/` directory for use by both client and server
- Type-safe with full TypeScript inference
- Ready to extend with communities, categories, and user relationships

### Authentication & Authorization

**Current Implementation**
- Basic user schema with username/password fields
- No authentication currently implemented (placeholder structure exists)
- Storage interface includes user lookup methods

**Planned Approach** (based on dependencies)
- Session-based authentication with `express-session`
- PostgreSQL session store via `connect-pg-simple`
- Password hashing (not yet implemented, but bcrypt likely)
- Protected routes for listing communities

### Build & Deployment

**Build Process**
- Client built with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.cjs`
- Custom build script orchestrates both builds
- Allowlist-based bundling for faster cold starts

**Development Workflow**
- Concurrent client (`vite dev`) and server (`tsx server/index.ts`) processes
- Hot module replacement for instant client updates
- Server auto-restart on file changes (via tsx)

**Replit-Specific Optimizations**
- Custom Vite plugins for Replit environment (cartographer, dev banner)
- Meta image plugin updates OpenGraph tags with correct Replit domain
- Runtime error modal for better debugging experience

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **drizzle-orm** + **drizzle-zod**: ORM and schema validation
- **express**: Web server framework
- **react** + **react-dom**: UI framework
- **vite**: Build tool and dev server
- **wouter**: Lightweight routing for React

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives (30+ component packages)
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **cmdk**: Command menu component

### Form & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Schema validation library

### Data Fetching & State
- **@tanstack/react-query**: Server state management
- **axios**: HTTP client (currently unused but available)

### Session Management
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store
- **memorystore**: In-memory session fallback

### Development Tools
- **typescript**: Type system
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler
- **@replit/vite-plugin-***: Replit-specific development plugins

### Third-Party Services (Potential)
Based on dependencies, the application may integrate:
- **stripe**: Payment processing (not yet implemented)
- **nodemailer**: Email sending (not yet implemented)
- **openai** / **@google/generative-ai**: AI features (not yet implemented)
- **passport** + **passport-local**: Authentication strategies (not yet implemented)

### Asset Management
- Custom `@assets` alias points to `attached_assets` directory
- Google Fonts: Outfit and Space Grotesk
- Custom favicon and OpenGraph images in `client/public`