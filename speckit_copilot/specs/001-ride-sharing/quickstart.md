# Quickstart: Ride-Sharing Web Application

**Date**: 2026-01-20 (Updated for Next.js Stack)  
**Feature**: Ride-Sharing Web Application (001-ride-sharing)  
**Development Environment Setup**

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 20.x LTS** ([download](https://nodejs.org))
- **npm 10.x** (comes with Node.js)
- **MongoDB 6.x** ([download](https://www.mongodb.com/try/download/community) or use Docker)
- **Git** ([download](https://git-scm.com))
- **Docker & Docker Compose** (optional, for MongoDB)
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - MongoDB for VS Code
  - REST Client (for testing API)

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ride-sharing-app
git checkout 001-ride-sharing
```

### 2. Install Dependencies

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
# MONGODB_URI=mongodb://localhost:27017/ride-sharing
# JWT_SECRET=your-super-secret-key-min-32-chars

# Install dependencies (single monolith with Next.js)
npm install

# Verify Node/npm versions
node --version  # Should be v20.x.x
npm --version   # Should be v10.x.x
```

### 3. Configure Environment Variables

Create `.env.local` in the project root (copy from `.env.example`):

```env
# Next.js Configuration
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ride-sharing-dev

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SENDER_EMAIL=noreply@ride-sharing.com

# Logging
LOG_LEVEL=debug
```

**Important**: Never commit `.env.local` to git (added to `.gitignore`)

### 4. Start MongoDB

**Option A: Using Docker Compose** (Recommended)

```bash
# Start MongoDB in background
docker-compose up -d mongodb

# Verify MongoDB is running
docker-compose ps

# Stop MongoDB
docker-compose down
```

**Option B: Local MongoDB Installation**

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows
# Use MongoDB Compass GUI or:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"

# Linux
sudo systemctl start mongod
```

**Verify Connection**:
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/ride-sharing-dev"
# Should connect successfully
```

### 5. Start Development Server

```bash
# Start Next.js development server (includes API routes + frontend)
npm run dev

# Server should be running at http://localhost:3000
```

**Development Server Includes**:
- Frontend: React pages with Server Components
- Backend: Next.js API routes at `/app/api/`
- Auto-reload on file changes
- TypeScript checking (if enabled)
- Built-in linting

### 6. Verify Setup

#### Test Backend API

```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "fullName": "Test User"
  }'

# Expected response:
# {"success": true, "data": {"_id": "...", "email": "test@example.com"}, "message": "User created successfully"}
```

#### Visit Frontend

```
http://localhost:3000
```

Should see login page with registration option.

---

## Project Structure

```
ride-sharing-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (login, register)
│   ├── (dashboard)/         # Protected routes (rides, bookings, profile)
│   ├── api/                 # REST API endpoints
│   ├── layout.jsx           # Root layout
│   └── page.jsx             # Home page
│
├── components/              # React components
│   ├── common/
│   ├── auth/
│   ├── rides/
│   ├── bookings/
│   └── profiles/
│
├── lib/                      # Utilities & libraries
│   ├── db.js                # MongoDB connection
│   ├── auth.js              # JWT & bcrypt utilities
│   ├── validators.js        # Joi validation schemas
│   └── errors.js            # Custom error classes
│
├── services/                # Business logic
│   ├── auth.service.js
│   ├── rides.service.js
│   ├── bookings.service.js
│   └── emails.service.js
│
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Ride.js
│   ├── BookingRequest.js
│   ├── Rating.js
│   └── Notification.js
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.js
│   ├── useRides.js
│   └── useBookings.js
│
├── tests/                   # Test files
│   ├── unit/
│   ├── api/
│   └── e2e/
│
├── .env.local              # Environment variables (local dev)
├── .env.example            # Environment template
├── next.config.js          # Next.js configuration
├── jest.config.js          # Jest testing configuration
├── playwright.config.js    # E2E testing configuration
├── package.json
└── README.md
```

---

## Development Commands

### Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate production optimized build and analyze bundle
npm run build -- --analyze
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file change)
npm test -- --watch

# Run specific test file
npm test -- auth.service.test.js

# Run tests with coverage report
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed
```

### Linting & Formatting

```bash
# Lint all files
npm run lint

# Lint and auto-fix issues
npm run lint -- --fix

# Format code with Prettier
npm run format

# Check Prettier formatting without changes
npm run format:check
```

### Database

```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/ride-sharing-dev

# View collections
show collections

# Insert test data
db.users.insertOne({ email: 'test@example.com', fullName: 'Test User' })

# Query users
db.users.find()
```

---

## Debugging

### Enable Debug Logging

```bash
# Set debug environment variable (enables detailed logs)
DEBUG=* npm run dev

# Or set specific namespace
DEBUG=ride-sharing:* npm run dev
```

### VS Code Debugger

Add `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

Then:
1. Press F5 or Debug → Start Debugging
2. Set breakpoints in code
3. Navigate to trigger code

### Browser DevTools

- **Frontend Components**: React DevTools extension
- **Network**: Chrome DevTools → Network tab (see API requests)
- **Console**: Chrome DevTools → Console (see frontend errors)

### API Testing with REST Client

Create `.rest` file:

```
### Test registration
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123",
  "fullName": "Test User"
}

### Test login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

Then click "Send Request" above each request.

---

## Troubleshooting

### Issue: MongoDB connection refused

**Solution**:
```bash
# Verify MongoDB is running
docker-compose ps

# Or manually start
docker-compose up -d mongodb

# Check connection string in .env.local
# MONGODB_URI=mongodb://localhost:27017/ride-sharing-dev
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process on port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

### Issue: Module not found errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Environment variables not loading

**Solution**:
```bash
# Ensure .env.local exists in project root (not in subdirectories)
ls -la .env.local

# Restart dev server after changing .env.local
# (Changes to env files require server restart)
```

### Issue: TypeScript errors (if using TypeScript)

**Solution**:
```bash
# Generate TypeScript types
npm run build

# Check TypeScript configuration
cat tsconfig.json
```

### Issue: Tests failing

**Solution**:
```bash
# Ensure test database is clean
mongosh mongodb://localhost:27017/ride-sharing-test
> db.dropDatabase()
> exit

# Run tests in verbose mode
npm test -- --verbose

# Run single test file to debug
npm test -- auth.service.test.js
```

---

## Performance Monitoring (Development)

### Analyze Bundle Size

```bash
npm run build -- --analyze
```

### Check Page Load Times

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check "Largest Contentful Paint" (LCP) timing (should be <2.5s)

### Monitor API Response Times

1. Open Chrome DevTools → Network tab
2. Make API requests
3. Click request → Timing tab
4. Verify <200ms p95 latency

---

## IDE Setup (VS Code)

### Recommended Extensions

1. **ESLint** - Linting
2. **Prettier** - Code formatting
3. **MongoDB for VS Code** - Database browser
4. **REST Client** - API testing
5. **Thunder Client** - Alternative API client
6. **GitLens** - Git history
7. **Jest Runner** - Run tests from editor

### Configuration (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.validate.enable": false,
  "eslint.probe": ["javascript", "javascriptreact"]
}
```

---

## CI/CD Integration (GitHub Actions)

See `.github/workflows/` for automated testing and deployment on push.

Workflows run:
1. **Linting**: ESLint check
2. **Unit Tests**: Jest coverage report
3. **Integration Tests**: API route testing
4. **E2E Tests**: Playwright workflows
5. **Build**: Production build verification

---

## Next Steps

1. **Create Test Data**: Run seed script to populate MongoDB with sample rides
2. **Explore API**: Use REST Client to test endpoints
3. **Browse Frontend**: Visit `http://localhost:3000` and test user flows
4. **Read Implementation Plan**: See `plan.md` for architecture details
5. **Start Implementation**: Begin with Phase 1 tasks from `tasks.md`

---

**Status**: ✅ Development environment ready. Proceed to Phase 1 implementation tasks.
