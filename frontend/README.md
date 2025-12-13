# DevTrack AI - Frontend

A Next.js application for tracking developer productivity across multiple platforms including AI assistants, VS Code, CLI tools, and browsers.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **API Key Management**: Auto-generated API keys for integration with external tools
- **Activity Dashboard**: View recent development activities and statistics
- **Team Support**: Personal workspaces for individual developers with organization support

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Hook Form** + **Zod** for form validation
- **Axios** for API communication
- **Sonner** for toast notifications

## Prerequisites

- Node.js 18+ and npm
- Running backend API (see backend README)

## Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                      # Next.js app router pages
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Login page
│   │   └── signup/          # Registration page
│   ├── dashboard/           # Main dashboard
│   └── layout.tsx           # Root layout
├── components/
│   ├── auth/                # Authentication components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── api/                 # API client and endpoints
│   └── stores/              # Zustand state management
└── public/                  # Static assets
```

## Key Features

### Authentication Flow

1. **Signup**: Create account and receive API key automatically
2. **Login**: Access dashboard with existing credentials
3. **Persistent Session**: Auth state saved in localStorage

### Dashboard

- Display and copy API key for integrations
- View recent activities (code, chat, commands, browser)
- Track statistics (total activities, code activities, pending processing)
- Quick start integration examples

### API Integration

The frontend communicates with the backend via:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/activities/my-activities` - Fetch user activities (requires x-api-key header)

## Using Your API Key

After signup, your API key is displayed on the dashboard. Use it to integrate DevTrack AI with:

### VS Code Extension
```
Settings → DevTrack API Key → Paste your key
```

### CLI
```bash
export DEVTRACK_API_KEY="your-api-key-here"
```

### Browser Extension
```
Extension Settings → API Key → Paste your key
```

## Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Authentication State Management

The app uses Zustand with persistence middleware to:
- Store user data, token, and API key in localStorage
- Auto-inject auth tokens in API requests
- Handle session rehydration on page reload
- Manage loading states during auth operations

## API Client Configuration

The API client (`lib/api/client.ts`) automatically:
- Injects auth tokens from cookies
- Handles 401 unauthorized errors
- Redirects to login on authentication failure
- Manages request/response interceptors

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running on `http://localhost:5001`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### API key not showing
- Verify backend is generating API keys on registration
- Check browser console for errors
- Ensure you're logged in with a valid session

### Activities not loading
- Confirm backend `/api/activities/my-activities` endpoint is working
- Check that you have a valid API key
- Verify network requests in browser DevTools

## Contributing

When making changes:
1. Follow TypeScript strict mode
2. Use Tailwind CSS for styling
3. Validate forms with Zod schemas
4. Handle errors with toast notifications
5. Maintain responsive design patterns

## License

MIT
