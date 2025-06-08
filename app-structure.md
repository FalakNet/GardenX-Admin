# GardenX Admin Application Structure

## Directory Structure

```
gardenx-admin/
├── actions/                   # Server actions
│   ├── dashboard.ts           # Dashboard data fetching
│   └── ...                    # Other server actions
├── app/                       # Next.js App Router directory
│   ├── (admin)/               # Admin route group
│   │   ├── page.tsx           # Dashboard page
│   │   ├── products/          # Products management section
│   │   │   └── page.tsx
│   │   ├── orders/            # Orders management section
│   │   │   └── page.tsx
│   │   ├── customers/         # Customer management section
│   │   │   └── page.tsx
│   │   └── pos/               # Point of Sale system
│   │       └── page.tsx
│   ├── page.tsx               # Root page (alternative dashboard)
│   └── layout.tsx             # Root layout
├── components/                # Shared components
│   ├── admin/                 # Admin-specific components
│   │   └── dashboard-stats.tsx # Dashboard statistics component
│   ├── header.tsx             # Header component
│   ├── sidebar.tsx            # Sidebar navigation component
│   └── ui/                    # UI component library
│       ├── button.tsx         # Button component
│       ├── card.tsx           # Card component
│       └── ...                # Other UI components
├── types/                     # TypeScript type definitions
│   └── index.ts               # Shared type definitions
├── public/                    # Static assets
└── ...                        # Configuration files
```

## Key Directories

### Actions Directory
Contains server actions for data fetching and mutations using the "use server" directive.

### App Directory
Contains all the routes and pages of the application using Next.js App Router. The `(admin)` folder is a route group for admin-related pages.

### Components Directory
Contains reusable components used throughout the application:
- `admin/`: Admin-specific components like dashboard statistics
- `header.tsx`: Page header with title, subtitle and actions
- `sidebar.tsx`: Navigation sidebar
- `ui/`: Contains primitive UI components like buttons, cards, etc.

### Types Directory
Contains TypeScript interface and type definitions used across the application.

### Route Structure
- `/`: Main dashboard with statistics and quick actions
- `/products`: Product management
- `/orders`: Order management
- `/customers`: Customer management
- `/pos`: Point of Sale system

## Component Architecture

The application uses a component-based architecture with:
- Page components that define routes
- Shared UI components for consistent design
- Specialized components for specific functionality (like dashboard stats)
- Server components for data fetching with server actions

The UI follows a layout with a persistent sidebar and header, with the main content changing based on the route.
