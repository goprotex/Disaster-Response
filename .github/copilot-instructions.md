<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Disaster Coordination App - Development Guidelines

## Project Overview
This is a disaster coordination app built with Next.js 14, React 18, TypeScript, TailwindCSS, and Supabase. It helps victims, volunteers, and organizations coordinate disaster response through an interactive map interface.

## Tech Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: TailwindCSS with custom disaster-themed color palette
- **Database**: Supabase (PostgreSQL with PostGIS for geospatial data)
- **Maps**: React-Leaflet with OpenStreetMap tiles
- **State Management**: Zustand and React Query
- **Testing**: Vitest for unit tests, Cypress for E2E
- **Image Processing**: EXIF extraction and compression
- **Auth**: Supabase Auth with magic links

## Key Features
1. **Interactive Map**: Display requests, offers, and resource zones
2. **Photo Upload**: EXIF GPS extraction and image compression
3. **Real-time Updates**: Supabase real-time subscriptions
4. **Claim System**: Volunteers can claim requests and get contact info
5. **Geospatial Search**: PostGIS-powered location queries
6. **PWA Support**: Offline-capable progressive web app

## Code Style Guidelines
- Use TypeScript for all new files
- Follow React functional components with hooks
- Use TailwindCSS classes, leverage custom disaster-* color palette
- Implement proper error handling and loading states
- Use Supabase client for all database operations
- Follow Next.js App Router conventions (app/ directory)

## File Structure
```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable React components
├── lib/          # Utilities and configurations
└── types/        # TypeScript type definitions
```

## Database Schema
- `requests`: Disaster assistance requests with GPS coordinates
- `offers`: Help offers from volunteers/organizations  
- `zones`: Resource zones (WiFi, shelters, etc.)
- `profiles`: Extended user information
- `flags`: Content moderation system

## Security Considerations
- Row Level Security (RLS) enabled on all tables
- Rate limiting on submissions
- EXIF GPS data privacy warnings
- Input validation and sanitization

## Testing Strategy
- Unit tests for utility functions
- Component tests for React components
- E2E tests for critical user flows (submit → claim → fulfill)
- Test geospatial queries and real-time updates

## Performance
- Dynamic imports for map components (SSR issues)
- Image compression before upload
- Efficient spatial indexes
- Lazy loading and pagination
