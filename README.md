# 🌪️ Disaster Coordination App

A real-time disaster response coordination platform built with Next.js 14, React 18, TypeScript, TailwindCSS, and Supabase. This app helps victims, volunteers, and organizations coordinate disaster response through an interactive map interface.

## 🚀 Features

- **Interactive Map**: Display requests, offers, and resource zones on an interactive map
- **Photo Upload**: EXIF GPS extraction and automatic image compression
- **Real-time Updates**: Live updates using Supabase real-time subscriptions
- **Claim System**: Volunteers can claim requests and receive contact information
- **Geospatial Search**: PostGIS-powered location-based queries
- **PWA Support**: Progressive Web App for offline capabilities
- **Mobile-First**: Responsive design optimized for mobile devices

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: TailwindCSS with custom disaster-themed color palette
- **Database**: Supabase (PostgreSQL with PostGIS extension)
- **Maps**: React-Leaflet with OpenStreetMap tiles
- **State Management**: Zustand and React Query
- **Testing**: Vitest for unit tests, Cypress for E2E testing
- **Image Processing**: EXIF data extraction and browser-based compression
- **Authentication**: Supabase Auth with magic links

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- (Optional) Mapbox account for advanced mapping features

### 1. Clone and Install

```bash
git clone <repository-url>
cd disaster-coordination-app
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Map Configuration  
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create tables, indexes, and policies

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # Global providers
├── components/            # Reusable React components
│   ├── DisasterMap.tsx    # Interactive map component
│   └── RequestForm.tsx    # Request submission form
├── lib/                   # Utilities and configurations
│   ├── supabase.ts        # Supabase client and types
│   └── utils.ts           # Image processing and utilities
└── test/                  # Test setup files
```

## 🧪 Testing

### Unit Tests
```bash
npm run test          # Run Vitest tests
npm run test:ui       # Run with UI
```

### E2E Tests
```bash
npm run test:e2e         # Open Cypress UI
npm run test:e2e:headless # Run headless
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🗄️ Database Schema

### Core Tables

- **requests**: Disaster assistance requests with GPS coordinates
- **offers**: Help offers from volunteers and organizations
- **zones**: Resource zones (WiFi, shelters, fuel stations, etc.)
- **profiles**: Extended user information
- **flags**: Content moderation system

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own content
- Public read access for coordination purposes
- Rate limiting on submissions

## 🔧 Development

### Code Style

- TypeScript for type safety
- React functional components with hooks
- TailwindCSS for consistent styling
- Custom `disaster-*` color palette for theming

### Key Components

1. **DisasterMap**: Interactive Leaflet map with custom markers
2. **RequestForm**: Photo upload with EXIF processing
3. **Providers**: React Query and Supabase context providers

### Performance Optimizations

- Dynamic imports for map components (avoid SSR issues)
- Image compression before upload
- Efficient PostGIS spatial indexes
- Lazy loading and pagination for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for refactoring

## 📋 Roadmap

### MVP (Week 1-3)
- [x] Basic map interface
- [x] Request submission with photos
- [x] Database schema and security
- [ ] Claim system implementation
- [ ] Real-time updates
- [ ] Basic testing suite

### Future Enhancements
- [ ] SMS integration with Twilio
- [ ] AI damage assessment from photos
- [ ] Push notifications
- [ ] Offline-first sync
- [ ] Multi-language support
- [ ] Advanced admin dashboard

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email [maintainer@email.com] or create an issue in the repository.

---

**Built for disaster response coordination. Every second counts. 🚨**
