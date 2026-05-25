# AstroWave Ghana

## Africa's Next-Generation Entertainment Powerhouse

AstroWave is a creative force redefining African entertainment. Based in Accra, Ghana, the platform serves as a unified ecosystem for immersive events, professional talent management, and creative culture.

### 🚀 Key Modules

#### 1. Public Experience Hub
- **Cinematic Discovery:** High-impact video hero sections and immersive visual storytelling.
- **AI Vibe Navigator:** A Genkit-powered AI agent that recommends events, talent, and music based on user-described moods and energy levels.
- **Live Listings:** Real-time event discovery with category filtering and dynamic status tracking.

#### 2. The Matching Engine
- **Vibe Sync Algorithm:** A proprietary engine that calculates matching percentages between event briefs and talent profiles based on Location (30%), Category (40%), and Wave Score (30%).
- **Professional Roster:** A curated registry of DJs, MCs, Singers, and performers, ranked by their global "Wave Score."

#### 3. Talent & Organizer Portals
- **Organizer Dashboard:** Full pipeline management for event briefs, AI-generated matches, and transactional bookings.
- **Talent Portfolio:** Dynamic artist profiles featuring auto-calculated Wave Scores, community reviews, and media reels.
- **Booking Gateway:** Secure protocol for engagement requests, acceptance, and post-event rating synchronization.

#### 4. The Dev Command Center
- **Brand Assets Manager:** Direct control over logos, favicons, and OG images with real-time Firestore-to-DOM synchronization.
- **Cloudinary Explorer:** A specialized file browser that maintains a 1:1 registry between Cloudinary storage and Firestore media schemas.
- **Algorithm Simulator:** Debugging tools for the Wave Score and Match Engine to fine-tune platform sensitivity.

### 🛠 Technical Architecture

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
- **UI System:** ShadCN UI components with custom Neon-Glow extensions.
- **Backend:** 
  - **Firebase Auth:** Google & Email identity providers.
  - **Firestore:** Real-time document database with a strictly mapped media schema.
  - **Firebase Admin SDK:** Secure server-side user provisioning and role management.
- **Media:** Cloudinary (CDN) for optimized image and video delivery.
- **AI:** Genkit integrated with Google Gemini for discovering "vibes" and intelligent matching.

### 🎨 Brand Standards
- **Primary Color:** Neon Green (#00FF87)
- **Accent Colors:** Electric Blue (#0EA5E9), Gold (#FFD166)
- **Base Background:** Deep Navy (#020B18)
- **Typography:** `Bebas Neue` (Display), `Outfit` (Body)

### 🌊 The Wave Score Formula
AstroWave uses a weighted multi-factor calculation to rank talent:
`WS = [(Rating / 5) * 0.6] + [Min(Events / 20, 1) * 0.2] + (RecencyFactor * 0.2) * 5`

---
© 2025 AstroWave Ghana. Developed for the next generation of African creators.
