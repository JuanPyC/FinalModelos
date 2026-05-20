# Speak Up Frontend Design Specification

**Goal:** Create a minimalist, light-themed web application for managing the Speak Up English Academy, enabling efficient administration of students, sessions, enrollments, and fines.

**Architecture:**
- **Single Page Application (SPA):** Built with React 19 and Vite.
- **Layered Structure:**
    - `api/`: Axios instances and API client configuration.
    - `services/`: Business logic and data transformation layer (mapping API responses to UI models).
    - `hooks/`: Custom hooks using TanStack Query for data fetching and mutations.
    - `components/`: Reusable UI primitives (Buttons, Inputs, Cards).
    - `layouts/`: Master layouts (MainLayout with Sidebar).
    - `pages/`: Individual route views.
    - `types/`: TypeScript interfaces shared across the application.

**Tech Stack:**
- **Frontend Framework:** React 19
- **Styling:** Tailwind CSS (Light mode, minimalist aesthetics)
- **State Management:** TanStack Query (Server state), React Context (UI state)
- **HTTP Client:** Axios
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod (Validation)

**UI/UX Design:**
- **Theme:** "Snow White" minimalist.
- **Colors:**
    - Background: `#FFFFFF`
    - Secondary Background: `#F9FAFB`
    - Border/Divider: `#E5E7EB`
    - Primary Action: `#2563EB` (Speak Up Blue)
    - Text: `#111827` (Dark Slate)
- **Layout:** Fixed Sidebar with a responsive main content area.
- **Components:** High use of whitespace, rounded corners (`rounded-lg`), and subtle shadows (`shadow-sm`).

**Key Features:**
1.  **Dashboard:** KPI cards (Total Students, Active Sessions, Pending Fines).
2.  **Student Management:** searchable list, profile view, and creation form.
3.  **Session Scheduler:** List view of sessions with teacher and room assignments.
4.  **Enrollment Flow:** Interface to assign students to sessions with automated capacity checking.
5.  **Fines Tracking:** Dashboard to monitor and update payment status of attendance-related fines.

**Integration:**
- Connects to the Express backend running on `http://localhost:3000/api`.
- Uses standard RESTful patterns.
- Automated error handling via Axios interceptors and UI toast notifications.
