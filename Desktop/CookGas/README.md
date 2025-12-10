# Jupitra - Gas Delivery Marketplace

A production-ready gas delivery platform connecting vendors with customers.

## Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Database**: PostgreSQL + PostGIS (geospatial queries)
- **Cache**: Redis (sessions, rate limiting, job queues)
- **Real-time**: WebSockets (Socket.io)

## Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- npm >= 9

### Installation

```bash
# Install dependencies
npm install

# Start infrastructure (Postgres + Redis)
docker-compose up postgres redis -d

# Run migrations
npm run migrate --workspace=apps/api

# Start development servers
npm run dev
```

The application will be available at:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs

### Using Docker (Full Stack)

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down
```

## Project Structure

```
/
├── apps/
│   ├── api/           # Express backend
│   └── web/           # Next.js frontend
├── packages/
│   └── shared/        # Shared types/utilities
├── docker/            # Docker configurations
└── docs/              # Documentation
```

## Development

```bash
# Run backend only
npm run dev:api

# Run frontend only
npm run dev:web

# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build
```

## Features

- ✅ User authentication (JWT)
- ✅ Vendor onboarding & KYC
- ✅ Geospatial vendor discovery
- ✅ Real-time order tracking
- ✅ Payment integration (Paystack/Flutterwave)
- ✅ Admin dashboard
- ✅ Dispute management
- ✅ Safety guidelines

## Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Deployment Guide](./docs/deployment.md)

## License

Proprietary
