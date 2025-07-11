# ft_transcendence-ms-frontend

Frontend microservice for the ft_transcendence project built with TypeScript and Tailwind CSS.

## Features

- **Authentication**: Login/Register with email/password
- **Google OAuth**: Sign in with Google account
- **Two-Factor Authentication**: WebAuthn and backup codes support
- **Responsive Design**: Built with Tailwind CSS
- **Single Page Application**: Client-side routing with history support
- **Modern Stack**: TypeScript, Vite, and modern web standards

## Tech Stack

- **Frontend**: TypeScript, Vite, Tailwind CSS
- **Authentication**: JWT tokens with refresh logic
- **API Client**: Axios with interceptors
- **Deployment**: Docker with Nginx
- **Development**: Hot reload with Vite dev server

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (for containerized deployment)

### Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Production Build

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

### Docker Deployment

#### Development
```bash
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build
```

#### Production
```bash
docker-compose up --build
```

## Project Structure

```
src/
├── api/           # API client and types
├── pages/         # Page components
├── router/        # Client-side routing
├── main.ts        # Application entry point
└── style.css      # Global styles and Tailwind imports
```

## API Endpoints

The frontend consumes the following endpoints from the ms-auth service:

- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback
- `POST /2fa/enable` - Enable two-factor authentication
- `POST /2fa/disable` - Disable two-factor authentication
- `POST /2fa/backup-codes/generate` - Generate backup codes
- `DELETE /delete/:id` - Delete user account

## Environment Variables

The application expects the auth service to be running on `http://localhost:3001` by default. This can be configured in `src/api/auth.ts`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Follow Tailwind CSS conventions
4. Test your changes thoroughly
5. Ensure Docker builds work correctly

## License

This project is part of the ft_transcendence school project. 