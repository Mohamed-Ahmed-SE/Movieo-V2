# Environment Variables Setup Guide

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values (see below)

## Required Variables

### 1. MongoDB Database (`MONGODB_URI`)

**Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/movieo
```

**MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movieo
```

### 2. JWT Secret (`JWT_SECRET`)

Generate a secure random string:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Or use a password generator** - Make it at least 32 characters long.

### 3. TMDB API Key (`TMDB_API_KEY`)

1. Go to https://www.themoviedb.org/
2. Create an account
3. Go to Settings > API
4. Request an API key
5. Copy your API key

### 4. Frontend URL (`FRONTEND_URL`)

For local development:
```
FRONTEND_URL=http://localhost:3000
```

For production, use your domain:
```
FRONTEND_URL=https://yourdomain.com
```

## Optional Variables

### OAuth (Google & GitHub)

**Google OAuth:**
1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Client Secret

**Note:** OAuth is optional - the app will work without it, but users won't be able to sign in with Google/GitHub.

### Port (`PORT`)

Default is 5000. Change if needed:
```
PORT=5000
```

### Node Environment (`NODE_ENV`)

For development:
```
NODE_ENV=development
```

For production:
```
NODE_ENV=production
```

## Example .env File (Minimum Required)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movieo
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters
TMDB_API_KEY=your-tmdb-api-key-here
FRONTEND_URL=http://localhost:3000
```

## Security Notes

- **Never commit `.env` file to git** (it's already in `.gitignore`)
- **Use different JWT_SECRET for production**
- **Keep API keys secure**
- **Use environment variables in production** (not .env files)



