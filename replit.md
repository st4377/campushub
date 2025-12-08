# Campus Communities Hub

## Overview

Campus Communities Hub is a web application designed to connect college students with various campus communities across different platforms (WhatsApp, Telegram, Discord, Instagram). The application functions similar to Disboard.org but specifically for college communities. Users can browse and search communities without authentication, while listing a community requires user registration and login.

The application features a modern, dark-themed interface with yellow/orange accent colors, inspired by platforms like Studique and Disboard. It provides a central directory for students to discover study groups, clubs, social communities, and interest-based groups within their college ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest Session)

### Completed Features

1. **Dashboard Separation into Distinct Pages**
   - **Submission Status page** (`/submission-status`): Dedicated page for tracking all submissions
     - Displays pending, approved, and rejected submissions in separate sections
     - Shows rejection reasons for rejected submissions
     - Stats summary showing counts for each status
     - Detail modal for viewing full submission information
   - **My Communities page** (`/my-communities`): Dedicated page for managing approved communities
     - List of active communities using CommunityCard display
     - Edit functionality (name, invite link, tags, image only)
     - Delete functionality with soft-delete (keeps history)
     - Deleted communities history section (read-only)
   - **Dashboard page** (`/dashboard`): Simplified overview
     - User profile card with account details
     - Stats grid showing active, pending, approved, rejected counts
     - Quick access cards linking to Submission Status and My Communities
     - Sidebar navigation with links to all management pages

2. **Admin Search System and Unique Tag ID**
   - Unique Admin Tag IDs generated for every community submission (format: XXCM0001)
   - Category-based prefixes: SG=Study Groups, CT=Coding & Tech, TF=Trading & Finance, etc.
   - Search functionality in admin panel for both Pending and Approved tabs
   - Live filtering by community name, tags, description, and admin tag ID
   - Tag ID displayed on all admin dashboard cards with monospace font styling
   - Database: Added adminTagId column to pending_communities, approved_communities, rejected_communities
   - Tag IDs preserved when moving communities between approval states
   - Existing communities backfilled with appropriate tag IDs

3. **My Communities Management Section**
   - Users can manage their approved communities from the dashboard
   - Active communities displayed using CommunityCard component (same as homepage)
   - Edit functionality restricted to: name, invite link, logo/icon, tags only
   - Delete performs soft-delete: removes from public view but keeps in database history
   - Deleted Communities section shows read-only history with deletion dates
   - API endpoints: GET /api/user/communities/:userId, PATCH /api/user/communities/:id, DELETE /api/user/communities/:id
   - Database: Added deletedAt column to approved_communities for soft-delete tracking
   - Ownership validation: Users can only edit/delete their own communities
   - Public endpoints filter out soft-deleted communities (isActive=false)

2. **Admin Edit Feature for Pending Submissions**
   - Admins can edit all community fields before approving/rejecting
   - Editable fields: name, description, platform, invite link, tags, category, visibility
   - Edit button added to each pending submission card in admin panel
   - Edit dialog with form fields, dropdowns for platform/category/visibility
   - Tags entered as comma-separated values, converted to array on save
   - API endpoint: PUT /api/admin/pending/:id with admin authentication
   - Changes saved to database and reflected immediately in the pending list

2. **Community Photo Upload Feature**
   - Users can upload photos when listing their community
   - Drag-and-drop or click-to-upload interface with image preview
   - File validation: JPEG, PNG, WebP, GIF formats, max 2MB size
   - Photos stored in /uploads/communities/ directory
   - Images displayed across all views: home page cards, dashboard, admin panel
   - Fallback to platform icon/initials when no image uploaded

2. **Login/Signup Flip Card Animation**
   - Implemented 3D flip card animation using CSS transforms and Framer Motion
   - Login form on front face, signup form on back face
   - Clicking "Sign up" flips the card to show registration form
   - Clicking "Log in" flips back to login form
   - Smooth 0.6s transition with ease-in-out timing

2. **User Registration System**
   - Signup form collects: Full Name, Email, Password
   - Password validation (minimum 6 characters)
   - Email uniqueness check on server
   - Password hashing with bcrypt (salt rounds: 10)
   - User data stored in PostgreSQL database

3. **User Dashboard Page**
   - Created /dashboard route for authenticated users
   - Displays user profile with initials avatar
   - Shows statistics cards (Communities Listed, Member Since)
   - Quick actions: List a Community, Browse Communities
   - Account settings section showing user details
   - Logout functionality

4. **My Approvals Section in Dashboard**
   - Displays all communities submitted by the user
   - Shows approval status: Pending (yellow), Approved (green), Rejected (red)
   - For rejected submissions, displays the rejection reason from admin
   - Real-time count of approved communities in stats card
   - Loading and empty states for better UX

5. **Authentication API Endpoints**
   - POST /api/auth/signup - User registration with validation
   - POST /api/auth/login - User login with password verification
   - GET /api/user/submissions/:userId - Fetch user's pending, approved, rejected submissions
   - Returns sanitized user data (password excluded)
   - React Context (AuthProvider) for persistent login state across pages

6. **Admin Rejection with Reason**
   - Admin panel has rejection dialog with reason input
   - Rejection reason saved to rejected_communities table
   - Reason displayed to user in their dashboard

7. **List Community Login Requirement**
   - Users must be logged in to list a community
   - Login Required popup appears if user visits page without authentication
   - Popup has "Log In to Continue" button redirecting to login page
   - "Back to Home" button for users who don't want to login
   - Form is only accessible to authenticated users

8. **Database Schema Updates**
   - Users table: id, fullName, email, password, createdAt
   - Pending/Approved communities: Added userId column to track submitter
   - Rejected communities table: Stores rejected submissions with rejectionReason
   - Email column has unique constraint
   - Zod validation schema for signup input

### Previous Features
- Login Page with decorative characters (orange blob + purple rectangle)
- Home Page filter functionality
- List Community submission flow with confirmation dialog
- Dialog/Modal center pop-in animations

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
- **Users table**: Full authentication structure with id, fullName, email (unique), password (hashed), createdAt
- Uses PostgreSQL's `gen_random_uuid()` for primary keys
- Email uniqueness constraint for preventing duplicate registrations
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