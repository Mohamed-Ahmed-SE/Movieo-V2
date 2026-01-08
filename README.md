# Movieo V2 - Comprehensive Media Tracking Platform

A modern, full-stack application for tracking and managing movies, TV shows, anime, manga, and manhwa. Built with React, Node.js, Express, and MongoDB. Features a beautiful, responsive UI with advanced tracking capabilities, achievements, personalized customization options, and stunning GSAP animations.

![Movieo V2](https://img.shields.io/badge/version-2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features

- 🎬 **Multi-Media Support**: Track movies, TV series, anime, manga, and manhwa in one unified platform
- 📊 **Progress Tracking**: Track episodes watched, seasons completed, and manga/manhwa reading progress (completed items, not chapters)
- ⭐ **Ratings & Notes**: Personal ratings and notes for each media item
- 📝 **Multiple Lists**: Organize content into Watching, Completed, Planned, Dropped, and On Hold lists
- 🎨 **Image Customization**: Per-user customization of media posters and backgrounds with automatic old image cleanup
- 👤 **User Profiles**: Comprehensive profiles with detailed statistics and visual achievements
- 🏆 **Achievement System**: Unlock achievements based on viewing/reading progress across multiple categories (tracks completed manga items, not chapters)
- 🔍 **Unified Search**: Advanced search with filtering by media type (Anime, Movies, Manga, Series) and trending content display
- 🌐 **Guest Mode**: Browse content without creating an account
- 🔐 **Authentication**: JWT-based authentication with OAuth support (Google, GitHub)
- 📱 **Responsive Design**: Fully responsive design that works on all devices
- 🎨 **Dynamic Landing Page**: Category-based content filtering (All, Movies, TV, Anime, Manga) with unique sections

### Media Features

- **Smart Type Detection**: Automatically detects Japanese TV series as anime, Korean manga as manhwa
- **Character Information**: View detailed character information for anime and manga
- **Episode/Chapter Tracking**: Track individual episodes and chapters with watched status
- **Related Content**: Discover similar and recommended content
- **Trending Content**: View trending content by category with real-time updates
- **Image Galleries**: Browse posters, backdrops, and logos for all media types
- **Logo Support**: Dynamic logo fetching and display in cards and hero sections
- **Trailer Support**: Watch trailers directly in the app
- **News Integration**: Stay updated with the latest media news

### UI/UX Features

- **Modern Design**: Clean, Netflix-inspired interface with glassmorphism effects and backdrop blur
- **Smooth GSAP Animations**: Professional-grade, GPU-accelerated animations throughout the app
  - Optimized hero section animations with better easing
  - Smooth content transitions with force3D acceleration
  - Interactive hover effects
  - Staggered animations with performance optimizations
- **Dark Theme**: Beautiful dark theme optimized for media consumption
- **Interactive Cards**: MediaCard component with hover effects showing detailed information, logos, and metadata
- **Explore Pages**: Clean, modern layout with genre browsing, trending content, and popular grids
- **Search Page**: Full-screen search with fuzzy matching, trending content, and responsive grid
- **Settings Page**: Modern settings with theme toggle, auto-play options, and notification controls
- **Responsive Design**: Fully responsive across all devices with mobile-first approach
- **Skeleton Loaders**: Elegant loading states throughout
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Optimistic UI**: Instant feedback for user actions with background API calls

### Recent Enhancements

#### UI/UX Improvements
- ✨ **Landing Page**: Fully responsive with improved GSAP animations, dynamic genre posters, Radix/Lucide icons
- 📱 **Mobile Responsiveness**:
  - **Details Page**: Optimized layout with main content first, improved hero visibility, and proper stacking
  - **Navigation**: Redesigned navbar with hamburger menu for mobile/tablet devices
  - **Touch Friendly**: Optimized touch targets and scrolling experiences
- 🎨 **Modern Design**:
  - **Glassmorphism**: Enhanced UI with frosted glass effects in About and Info sections
  - **Rich Iconography**: Integration of Lucide icons for better visual hierarchy
  - **Home Screen**: Added 3 new creative sections (Featured Spotlight, Bento Grid, Trending Grid)
- 📰 **News Section**: Modernized design with update button and improved responsiveness
- 🔍 **Explore Page**: Complete redesign with cleaner, more modern layout
- 📋 **Watchlist**: Fully responsive with mobile-friendly horizontal scrollable filters
- ⚙️ **Settings Page**: New options (Theme, Auto-play, Adult Content, Notifications) with apply/unapply functionality
- 🔎 **Search**: Fuzzy search implementation with better matching and relevance sorting
- 📄 **Details Page**: Complete overhaul with glassmorphism layout, responsive grid, dynamic ratings/votes, and restored hero logo
- 👤 **Profile Page**: Modernized design with better layout and card-based sections

#### Performance Optimizations
- ⚡ **Async Achievements**: Non-blocking achievement recalculation for faster UI updates
- 🚀 **Optimistic Updates**: Instant UI feedback for list operations
- ⏱️ **Debouncing**: Reduced API calls with debounced stats/achievements fetching
- 🎬 **GSAP Optimization**: GPU-accelerated animations with improved easing and performance
- 🔄 **Reduced Re-renders**: Optimized component rendering and state management

#### Technical Improvements
- 🎯 **Genre Browsing**: Fixed to search by genre ID instead of title matching
- 🖼️ **Modal Improvements**: All modals redesigned for better responsiveness and modern design
- 🎭 **Animation Enhancements**: Improved GSAP animations throughout (except navbar)
- 🐛 **Bug Fixes**: Fixed React Router context issues, icon imports, and error boundaries

## 🛠 Tech Stack

### Frontend

- **React 18** - Modern UI library with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Redux Toolkit** - Efficient state management
- **React Router DOM v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **GSAP 3.14+** - Professional-grade animations with ScrollTrigger
- **Lenis** - Smooth scrolling library
- **Radix UI** - Accessible, unstyled component primitives
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful icon library
- **React Easy Crop** - Image cropping functionality
- **React Player** - Video player for trailers

### Backend

- **Node.js 18+** - JavaScript runtime
- **Express.js** - Fast, minimalist web framework
- **MongoDB 6.0+** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure token-based authentication
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Express Validator** - Input validation and sanitization
- **Bcryptjs** - Password hashing
- **Axios** - HTTP client for external APIs
- **Node Cache** - In-memory caching

### External APIs

- **TMDB API** - Movies and TV shows data, images, and metadata
- **AniList GraphQL API** - Anime and manga data, characters, and detailed information

### Development Tools

- **ES Modules** - Modern JavaScript module system
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📸 Screenshots

*Note: Add screenshots of your application here*

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (comes with Node.js)
- **MongoDB** 6.0.0 or higher (local installation or MongoDB Atlas account)
- **Git** (for cloning the repository)

### API Keys Required

1. **TMDB API Key**
   - Sign up at [TMDB](https://www.themoviedb.org/)
   - Go to Settings → API
   - Request an API key
   - Copy your API key

2. **OAuth Credentials (Optional)**
   - **Google OAuth**: Create credentials at [Google Cloud Console](https://console.cloud.google.com/)
   - **GitHub OAuth**: Create OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd "Movieo V2"
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Install backend dependencies**

```bash
cd ../backend
npm install
```

4. **Set up environment variables**

Create `backend/.env`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/movieo
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movieo?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# External APIs
TMDB_API_KEY=your-tmdb-api-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

Create `frontend/.env` (optional, defaults are usually fine):

```env
VITE_API_URL=http://localhost:5001
```

5. **Start MongoDB**

**Local MongoDB:**
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data
```

**MongoDB Atlas (Cloud):**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `backend/.env`

6. **Start the backend server**

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5001`

7. **Start the frontend development server**

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3001` (or the port Vite assigns)

8. **Open your browser**

Navigate to `http://localhost:3001` to see the application.

## 📁 Project Structure

```
Movieo V2/
├── backend/                      # Express backend API
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── database.js      # MongoDB connection
│   │   │   ├── jwt.js           # JWT configuration
│   │   │   └── oauth.js         # OAuth configuration
│   │   ├── controllers/         # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── mediaController.js
│   │   │   ├── userController.js
│   │   │   ├── listsController.js
│   │   │   ├── customizationController.js
│   │   │   └── achievementsController.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js          # JWT authentication
│   │   │   ├── errorHandler.js  # Error handling
│   │   │   ├── upload.js       # File upload handling
│   │   │   └── validate.js     # Input validation
│   │   ├── models/              # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── UserList.js
│   │   │   ├── UserProgress.js
│   │   │   ├── UserCustomization.js
│   │   │   └── Achievement.js
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── media.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── lists.routes.js
│   │   │   ├── customization.routes.js
│   │   │   └── achievements.routes.js
│   │   ├── services/            # Business logic services
│   │   │   ├── mediaService.js  # Media aggregation
│   │   │   ├── tmdbService.js   # TMDB API integration
│   │   │   ├── anilistService.js # AniList API integration
│   │   │   ├── listsService.js  # List management
│   │   │   ├── userService.js   # User management
│   │   │   ├── achievementsService.js # Achievement system
│   │   │   ├── customizationService.js # Image customization
│   │   │   └── authService.js  # Authentication logic
│   │   ├── utils/               # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── responseHelpers.js
│   │   │   └── validators.js
│   │   └── server.js           # Entry point
│   ├── uploads/                 # User-uploaded images
│   └── package.json
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── common/         # Shared/common components
│   │   │   │   ├── MediaCard.jsx # Universal media card component
│   │   │   │   ├── MediaGrid.jsx
│   │   │   │   ├── SkeletonLoader.jsx
│   │   │   │   └── ...
│   │   │   ├── details/        # Media details components
│   │   │   ├── explore/         # Explore page components
│   │   │   │   ├── ExploreBannerCard.jsx
│   │   │   │   ├── ExploreSection.jsx
│   │   │   │   └── ExploreHero.jsx
│   │   │   ├── features/        # Feature components
│   │   │   ├── home/           # Home page components
│   │   │   ├── landing/        # Landing page components
│   │   │   │   ├── sections/
│   │   │   │   │   ├── LandingHero.jsx # Hero with GSAP animations
│   │   │   │   │   ├── LandingGrid.jsx
│   │   │   │   │   ├── LandingNews.jsx
│   │   │   │   │   ├── LandingSpotlight.jsx
│   │   │   │   │   ├── LandingGenres.jsx
│   │   │   │   │   └── LandingTimeline.jsx
│   │   │   ├── layout/         # Layout components
│   │   │   ├── profile/        # Profile components
│   │   │   └── search/         # Search components
│   │   │       ├── SearchBannerCard.jsx
│   │   │       └── SearchBannerSection.jsx
│   │   ├── contexts/           # React contexts
│   │   │   ├── ModalContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useGSAP.js
│   │   │   ├── useHomeData.js
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── Auth/           # Auth pages
│   │   │   ├── explore/        # Explore pages
│   │   │   │   ├── MoviesExplore.jsx
│   │   │   │   ├── AnimeExplore.jsx
│   │   │   │   └── MangaExplore.jsx
│   │   │   ├── landing/        # Landing pages
│   │   │   │   └── Landing.jsx # Dynamic landing page
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx      # Full-screen search
│   │   │   ├── DetailsPage.jsx
│   │   │   └── ...
│   │   ├── services/           # API service functions
│   │   │   ├── api.js          # Axios instance
│   │   │   ├── mediaService.js
│   │   │   ├── authService.js
│   │   │   └── ...
│   │   ├── store/              # Redux store
│   │   │   ├── slices/         # Redux slices
│   │   │   └── store.js
│   │   ├── styles/             # Global styles
│   │   │   ├── index.css
│   │   │   └── explore.css
│   │   ├── utils/              # Utility functions
│   │   │   ├── mediaHelpers.js
│   │   │   ├── formatters.js
│   │   │   └── ...
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   ├── dist/                   # Production build
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker/                     # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
└── README.md
```

## 📡 API Documentation

### Base URL

```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### OAuth Login
```http
GET /api/auth/google
GET /api/auth/github
```

### Media Endpoints

#### Search Media
```http
GET /api/media/search?q=query&type=all&with_genres=false
```
**Query Parameters:**
- `q` (required): Search query
- `type` (optional): Filter by type (all, movie, tv, anime, manga)
- `with_genres` (optional): If true, searches by genre ID instead of title (for genre browsing)

#### Get Media Details
```http
GET /api/media/:type/:id
```
**Parameters:**
- `type`: Media type (movie, tv, anime, manga)
- `id`: Media ID

#### Get Media Images
```http
GET /api/media/:type/:id/images
```
Returns posters, backdrops, and logos for the media item.

#### Get Episodes
```http
GET /api/media/:type/:id/episodes
```
*For TV shows and anime only*

#### Get Characters
```http
GET /api/media/:type/:id/characters
```
*For anime and manga*

#### Get Trending Media
```http
GET /api/media/trending/:type?
```
**Parameters:**
- `type` (optional): Media type (movie, tv, anime, manga, all)

#### Discover Media by Genre
```http
GET /api/media/search?q=genreName&type=movie&with_genres=true
```
**Query Parameters:**
- `q` (required): Genre name (e.g., "Action", "Horror")
- `type` (required): Media type (movie, tv)
- `with_genres` (required): Must be true to search by genre ID

#### Get Person Details
```http
GET /api/media/person/:id
```

### User Lists Endpoints (Protected)

#### Get User Lists
```http
GET /api/lists
Authorization: Bearer <token>
```

#### Add to List
```http
POST /api/lists
Authorization: Bearer <token>
Content-Type: application/json

{
  "mediaId": "123",
  "mediaType": "movie",
  "listType": "watching"
}
```

#### Update List Item
```http
PUT /api/lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "listType": "completed",
  "rating": 5,
  "notes": "Great movie!"
}
```

#### Remove from List
```http
DELETE /api/lists/:id
Authorization: Bearer <token>
```

#### Update Progress
```http
POST /api/lists/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "mediaId": "123",
  "mediaType": "tv",
  "currentEpisode": 5,
  "currentSeason": 1
}
```

### User Endpoints (Protected)

#### Get User Statistics
```http
GET /api/users/stats
Authorization: Bearer <token>
```
Returns user statistics including:
- Total items watched/read
- Movies, TV shows, anime, manga counts
- Manga completed items (not chapters)

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "bio": "User bio"
}
```

#### Upload Avatar
```http
POST /api/users/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image file>
```

#### Upload Banner
```http
POST /api/users/upload-banner
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image file>
```

### Achievements Endpoints (Protected)

#### Get User Achievements
```http
GET /api/achievements
Authorization: Bearer <token>
```
Returns all achievements with progress tracking. Manga achievements track completed items, not chapters.

### Customization Endpoints (Protected)

#### Get Customization
```http
GET /api/customization/:mediaId
Authorization: Bearer <token>
```

#### Update Customization
```http
PUT /api/customization/:mediaId
Authorization: Bearer <token>
Content-Type: application/json

{
  "customPoster": "https://example.com/poster.jpg",
  "customBackground": "https://example.com/background.jpg"
}
```

#### Get All Customizations
```http
GET /api/customization
Authorization: Bearer <token>
```

## 🗄 Database Models

### User
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  avatar: String,
  banner: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### UserList
```javascript
{
  userId: ObjectId (ref: User),
  mediaId: String (required),
  mediaType: String (movie|tv|anime|manga),
  listType: String (watching|completed|planned|dropped|onHold),
  title: String,
  name: String,
  overview: String,
  description: String,
  original_language: String,
  origin_country: String,
  rating: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### UserProgress
```javascript
{
  userId: ObjectId (ref: User),
  mediaId: String (required),
  mediaType: String,
  currentEpisode: Number,
  currentSeason: Number,
  watchedEpisodes: [Number],
  watchedMovies: [String],
  updatedAt: Date
}
```

### UserCustomization
```javascript
{
  userId: ObjectId (ref: User),
  mediaId: String (required),
  mediaType: String,
  customPoster: String,
  customBackground: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Achievement
```javascript
{
  userId: ObjectId (ref: User),
  category: String (anime|tv|movie|animeMovie|manga),
  tier: String (bronze|silver|gold|platinum|diamond),
  progress: Number,
  target: Number,
  completed: Boolean,
  completedAt: Date
}
```

**Note**: Manga achievements track completed items, not chapters.

## 💻 Development

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

```bash
cd backend

# Start with auto-reload
npm run dev

# Start production server
npm start
```

### Code Structure Guidelines

#### Frontend Components

- **MediaCard**: Universal card component used throughout the app for displaying media items
  - Hover effects with detailed information
- Logo support with dynamic fetching
- Responsive design with proper hover positioning
- **MediaCardModal**: Modal for adding/updating media in lists
- **HeroSection**: Hero section for details pages with logo and backdrop
- **ExploreGrid**: Grid layout component for explore pages
- **SearchBannerCard**: Horizontal banner card for search and explore pages
- **LandingHero**: Hero section with GSAP animations for card-to-background transitions
- **ProfileStats**: User statistics display component
- **AchievementsSection**: Achievement badges and progress display

#### Backend Services

- **mediaService**: Aggregates and normalizes data from TMDB and AniList APIs
- **listsService**: Manages user lists, progress tracking, and list operations
- **userService**: User profile management and statistics calculation (manga completed items)
- **achievementsService**: Achievement calculation, tracking, and unlocking (manga tracks completed items)
- **customizationService**: Image customization management
- **tmdbService**: TMDB API integration and data fetching (includes genre_ids)
- **anilistService**: AniList GraphQL API integration (includes genres)

### Key Features Implementation

#### Media Type Detection

The app uses `getRealMediaType()` function to automatically detect:
- **Anime**: TV series with Japanese language (`original_language === 'ja'`)
- **Manhwa**: Korean manga (stored as `manga` but tracked separately)
- **Movies**: All movies remain as movies regardless of language

#### Image Customization

- Users can upload custom posters and backgrounds
- Old images are automatically deleted when new ones are uploaded
- Customizations are user-specific and override default images
- Supports both local uploads and external URLs

#### Achievement System

- **Categories**: Anime, TV Series, Movies, Anime Movies, Manga
- **Tiers**: Bronze, Silver, Gold, Platinum, Diamond
- **Progress Tracking**: Automatically calculates progress based on completed items
- **Manga Tracking**: Tracks completed manga items, not chapters
- **Unlock Notifications**: Modal notifications when achievements are unlocked

#### GSAP Animations

- **Hero Section**: Optimized card-to-background transitions with GPU acceleration
- **Content Transitions**: Staggered animations with force3D for better performance
- **Scroll Animations**: ScrollTrigger-powered animations on scroll
- **Hover Effects**: Smooth hover transitions on interactive elements
- **Performance**: All animations use willChange and force3D for optimal performance
- **Easing**: Improved easing functions (expo.out, power2.out) for smoother transitions

#### Landing Page

- **Fully Responsive**: Optimized for all device sizes
- **Improved Animations**: Smoother GSAP animations with better easing
- **Dynamic Genre Posters**: Posters change based on selected genre
- **Radix/Lucide Icons**: Modern icon system replacing emojis
- **Genre Browser**: Interactive genre selection with dynamic content loading

#### Performance Optimizations

- **Async Achievement Calculation**: Non-blocking achievement updates
- **Optimistic UI Updates**: Instant feedback for list operations
- **Debounced API Calls**: Reduced unnecessary API requests
- **Code Splitting**: Lazy loading for better initial load times
- **Image Optimization**: Efficient image loading and caching
- **Memoization**: Optimized component re-renders

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start containers
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop containers
docker-compose -f docker/docker-compose.yml down
```

### Manual Deployment

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Set Production Environment Variables**
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-domain.com
```

3. **Start Backend**
```bash
cd backend
npm start
```

4. **Serve Frontend**
   - Use nginx, Apache, or any static file server
   - Point to `frontend/dist` directory
   - Configure reverse proxy for API calls

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Use production MongoDB URI
- [ ] Set correct `FRONTEND_URL` for CORS
- [ ] Enable HTTPS
- [ ] Set up proper error logging
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and alerts

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Code Style

- Use ES6+ features
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused
- Use consistent styling (no corner radius except MediaCard)
- Ensure responsive design

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie and TV show data
- [AniList](https://anilist.co/) for anime and manga data
- [GSAP](https://greensock.com/gsap/) for powerful animation capabilities
- All the open-source libraries and frameworks that made this project possible

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on the repository
- Contact the development team

## 🔮 Future Enhancements

- [ ] Social features (friends, reviews, recommendations)
- [ ] Watch parties
- [ ] Mobile app (React Native)
- [ ] Advanced statistics and analytics
- [ ] Export/import data
- [ ] Multiple language support
- [ ] PWA support
- [ ] Offline mode
- [ ] Advanced filtering and sorting
- [ ] Recommendation engine
- [ ] Playlist creation and sharing
- [ ] Review and rating system
- [ ] Social feed and activity timeline

---

**Made with ❤️ by the Movieo Team**
