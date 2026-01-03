# Parking Available

A parking availability calendar application that allows owners to mark their parking spot availability and enables neighbors to view it.

## Features

- **Calendar View**: Visual calendar showing parking availability for each day
- **Three Status Types**:
  - **Disponible**: Parking is fully available
  - **Partiel**: Partially available (with time range selection)
  - **Indisponible**: Not available
- **Public Access**: Anyone can view the calendar without logging in
- **Owner Editing**: Authenticated owners can set and modify availability
- **French Interface**: All UI text is in French
- **Brutalist Design**: Raw, bold aesthetic with thick borders and monospace typography

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: React, TypeScript, Vite
- **Database**: SQLite
- **Deployment**: Docker, Docker Compose, Nginx
- **Authentication**: JWT-based

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/souf2222/parking-available.git
   cd parking-available
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Build and start containers:
   ```bash
   docker-compose up -d --build
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080

### Stopping

```bash
docker-compose down
```

## Usage

### For Neighbors (Viewers)

1. Open http://localhost
2. View the calendar to see parking availability
3. Click on any date to see details
4. Status indicators:
   - Green: Available
   - Orange: Partially available (dashed border)
   - Black: Unavailable
   - Grey: No availability set

### For Owners

1. Click "CONNEXION" to log in
2. Enter your credentials or register
3. Click on any date to set availability
4. Choose a status:
   - **Disponible**: Full day availability
   - **Partiel**: Select time range (from/to)
   - **Indisponible**: Not available
5. Click "Enregistrer" to save

### Default Users

The database seed creates:
- Owner: `admin` / `admin123`
- Owner: `jade` / `jade123`
- Neighbor: `bob` / `bob123`

## API Endpoints

### Availability

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/availability/:year/:month` | No | Get availability for a month |
| GET | `/api/v1/availability/:date` | No | Get availability for a specific date |
| POST | `/api/v1/availability` | Yes | Create/update availability |
| DELETE | `/api/v1/availability/:date` | Yes | Delete availability |

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/register` | No | Register new user |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## Environment Variables

```env
# Backend
PORT=8080
JWT_SECRET=your-secret-key-here

# Database
DATABASE_PATH=/app/data/parking.db
```

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Database Management

### Access Database

```bash
# Copy database from container
docker cp parking-available-backend-1:/app/data/parking.db ./parking.db

# Query with sqlite3
sqlite3 parking.db "SELECT * FROM availability;"

# Or use docker exec with cat
docker exec parking-available-backend-1 cat /app/data/parking.db | sqlite3 "SELECT * FROM users;"
```

### Update User Role

```bash
# Make user an owner
docker exec parking-available-backend-1 cat /app/data/parking.db | sqlite3 "UPDATE users SET role='owner' WHERE username='jade';"
```

## Project Structure

```
parking-available/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication
│   │   ├── models/
│   │   │   └── database.ts     # SQLite database operations
│   │   ├── routes/
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   └── availability.ts # Availability endpoints
│   │   └── index.ts            # Express server
│   ├── tests/                  # Backend tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.tsx    # Calendar component
│   │   │   └── Calendar.css
│   │   ├── pages/
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── *.css
│   │   ├── hooks/
│   │   │   └── useAuth.tsx     # Authentication hook
│   │   ├── services/
│   │   │   └── api.ts          # API service
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                  # Frontend tests
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

## License

MIT
