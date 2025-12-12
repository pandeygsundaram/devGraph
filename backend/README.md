# DevTrack AI Backend

A productivity tracking platform for engineering teams that automatically captures, summarizes, and preserves developer work context.

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **Prisma ORM 7** - Database ORM with PostgreSQL adapter
- **PostgreSQL** (Supabase) - Main database
- **Qdrant** - Vector database for semantic search
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database & Qdrant configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & other middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── generated/           # Auto-generated Prisma client

```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (already configured):

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Qdrant Vector DB
QDRANT_URL="https://..."
QDRANT_API_KEY="..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Request Examples

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Get Profile
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Models

### User
- Authentication and user management
- Roles: ADMIN, EMPLOYEE

### Team
- Team organization

### TeamMember
- User-team relationships with roles

### WorkLog
- Daily work summaries from multiple sources

### Activity
- Individual activity tracking (code, chat, commands)
- Linked to Qdrant vectors for semantic search

## Next Steps

1. Implement activity collection endpoints
2. Set up embedding generation service
3. Create Qdrant collections for vector storage
4. Build admin dashboard endpoints
5. Add search and query functionality
