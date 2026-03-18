# VisionPort CMS Dashboard

## Overview
A modernized GUI redesign for the VisionPort Content Management System. Built as a React/Tailwind prototype with a full Express/PostgreSQL backend. Uses Concept 1 custom color palette.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui components + react-resizable-panels
- **Backend**: Express.js + Drizzle ORM + PostgreSQL (Neon serverless)
- **Font**: Outfit (Google Fonts)

## Data Model
- **Playlists**: Collections of scenes (name, type)
- **Scenes**: Individual views within a playlist (name, description, sceneType, duration, sortOrder)
- **Assets**: Media files attached to scenes (name, assetType, position, dimensions, transparency)

## Key Files
- `client/src/pages/dashboard.tsx` - Main dashboard UI with resizable panels
- `client/src/index.css` - CSS variables for Concept 1 color palette
- `shared/schema.ts` - Drizzle schema definitions
- `server/routes.ts` - REST API endpoints (/api/playlists, /api/scenes, /api/assets)
- `server/storage.ts` - Database storage layer with CRUD operations
- `server/db.ts` - Drizzle database connection

## Color Palette (Concept 1)
- Background: `#e0eff3`
- Dark blue header: `#262f81`
- Medium blue primary: `#005670`
- Light blue border: `#6fb1c8`
- Accent yellow: `#d3bc5c`
- Orange danger: `#f65c00`
- Green success: `#799865`

## API Endpoints
- `GET/POST /api/playlists` - List/create playlists
- `PATCH/DELETE /api/playlists/:id` - Update/delete playlist
- `GET /api/playlists/:playlistId/scenes` - List scenes for playlist
- `POST /api/scenes` - Create scene
- `PATCH/DELETE /api/scenes/:id` - Update/delete scene
- `GET /api/scenes/:sceneId/assets` - List assets for scene
- `POST /api/assets` - Create asset
- `PATCH/DELETE /api/assets/:id` - Update/delete asset
- `POST /api/seed` - Seed initial data
