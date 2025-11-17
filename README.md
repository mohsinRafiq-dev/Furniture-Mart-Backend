# Furniture Mart Backend

Express.js backend for Ashraf Furnitures e-commerce platform

## Features

- Express.js server with TypeScript
- CORS support for frontend communication
- Morgan HTTP request logger
- Helmet security middleware
- Express Validator for input validation
- JWT authentication ready
- Comprehensive error handling
- Environment configuration with dotenv
- RESTful API structure

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Build

```bash
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration files
│   └── server.ts         # Main server file
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env                  # Environment variables
```

## API Routes

### Health Check

- `GET /api/health` - Server health status

### Products (Coming Soon)

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories (Coming Soon)

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

### Authentication (Coming Soon)

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3002
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h
```

## Error Handling

The server implements a comprehensive error handling system:

- Global error handler middleware
- Validation error responses
- Proper HTTP status codes
- Detailed error messages in development mode

## CORS Configuration

CORS is configured to accept requests from the frontend:

- Development: `http://localhost:3002`
- Production: Configure via `CORS_ORIGIN` environment variable

## License

MIT
