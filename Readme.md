# ThreadForge

A production-style REST API for a discussion forum with nested comments, JWT authentication, and a configurable credit reward system for post authors.

Built with Node.js, Express, TypeScript, MongoDB, and Mongoose, the project follows a layered architecture that separates HTTP handling, business logic, and data access.

---

## Project Overview

This backend powers a forum where authenticated users can publish posts, participate in threaded discussions, and earn credits as original posters when activity happens under their content.

The API is stateless and token-based. Passwords are hashed with bcrypt before storage, and protected routes validate JWTs on every request. Business rules—such as comment depth calculation, credit awards, and rollbacks—live in the service layer rather than in controllers or route definitions.

---

## Key Features

### Authentication
- User registration (`signup`) with email uniqueness validation
- User login with credential verification
- JWT-based session tokens with configurable expiry
- Password hashing via bcrypt (12 salt rounds) on user creation

### Posts
- Authenticated users can create posts
- Public feed listing all posts (newest first)
- Public single-post retrieval with author details
- Post creator is recorded as the Original Poster (OP)

### Nested Comments
- Unlimited comment depth via parent-child relationships
- Root comments on posts (`depth = 1`)
- Replies to comments (`depth = parent.depth + 1`)
- Comment tree metadata: `postId`, `parentCommentId`, `depth`

### Credit Reward System
- OP earns credits when comments are added under their post
- Reward amount depends on comment depth using an arithmetic progression
- Progression parameters are stored in MongoDB (`CreditConfig`), not hardcoded in application logic
- Initial config is seeded from environment variables on first use

### Credit Rollback
- Comment deletion triggers a soft delete (`isDeleted = true`)
- Previously awarded credits are subtracted from the OP using the stored `reward` value
- Only the comment author may delete their own comment

### User Dashboard
- Authenticated users can retrieve their profile and total earned credits via `GET /api/users/me`

---

## Architecture

Each request flows through a consistent pipeline:

```
HTTP Request
    → Route          (URL mapping, middleware chain)
    → Controller     (input validation, HTTP response)
    → Service        (business logic)
    → Model          (Mongoose schema / MongoDB)
    → MongoDB
```

**Design principles**

| Layer | Responsibility |
|-------|----------------|
| **Routes** | Define endpoints and attach middleware (e.g. `protect`) |
| **Controllers** | Validate request data, call services, format JSON responses |
| **Services** | Encapsulate business rules (auth, credits, comment depth) |
| **Models** | Define document schemas and database constraints |
| **Middleware** | Cross-cutting concerns: authentication, 404, error handling |
| **Utils** | Shared helpers: JWT, validators, `AppError`, `asyncHandler` |

Centralized error handling uses a custom `AppError` class and a global error middleware. Async route handlers are wrapped with `asyncHandler` so rejected promises propagate to the error handler automatically.

---

## Folder Structure

```
src/
├── config/
│   ├── db.ts              # MongoDB connection
│   └── env.ts             # Environment variable loading and validation
├── controllers/
│   ├── auth.controller.ts
│   ├── comment.controller.ts
│   ├── post.controller.ts
│   └── user.controller.ts
├── middleware/
│   ├── auth.ts            # JWT verification (protect)
│   └── error.ts           # 404 and global error handler
├── models/
│   ├── Comment.ts
│   ├── CreditConfig.ts
│   ├── Post.ts
│   └── User.ts
├── routes/
│   ├── auth.routes.ts
│   ├── comment.routes.ts
│   ├── post.routes.ts
│   └── user.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── comment.service.ts
│   ├── credit.service.ts
│   ├── post.service.ts
│   └── user.service.ts
├── types/
│   └── express/index.d.ts # Extends Request with req.user
├── utils/
│   ├── AppError.ts
│   ├── asyncHandler.ts
│   ├── jwt.ts
│   └── validators.ts
├── app.ts                 # Express app factory
└── server.ts              # Entry point (DB connect + listen)
```

---

## Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Display name |
| `email` | String | Unique, lowercase login identifier |
| `password` | String | Bcrypt hash (excluded from queries by default) |
| `credits` | Number | Total credits earned (default `0`) |
| `createdAt` / `updatedAt` | Date | Automatic timestamps |

Includes instance method `comparePassword()` for login verification.

### Post
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Post subject |
| `body` | String | Post content |
| `author` | ObjectId → User | Original Poster |
| `createdAt` / `updatedAt` | Date | Automatic timestamps |

### Comment
| Field | Type | Description |
|-------|------|-------------|
| `content` | String | Comment text |
| `author` | ObjectId → User | Comment author |
| `postId` | ObjectId → Post | Parent post |
| `parentCommentId` | ObjectId → Comment \| null | `null` for root comments |
| `depth` | Number | Nesting level (minimum `1`) |
| `reward` | Number | Credits awarded to OP for this comment |
| `isDeleted` | Boolean | Soft-delete flag (default `false`) |
| `createdAt` / `updatedAt` | Date | Automatic timestamps |

### CreditConfig (singleton)
| Field | Type | Description |
|-------|------|-------------|
| `singletonKey` | String | Always `"singleton"` — enforces one config document |
| `firstTerm` | Number | Base reward for depth-1 comments |
| `commonDifference` | Number | Increment added per depth level |
| `createdAt` / `updatedAt` | Date | Automatic timestamps |

---

## API Modules

Base URL: `http://localhost:5000/api`

All JSON responses follow `{ success: boolean, message?: string, data?: ... }`.

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Server health check |

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | No | Register a new user |
| `POST` | `/login` | No | Authenticate and receive a JWT |

### Posts — `/api/posts`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Yes | Create a post |
| `GET` | `/` | No | List all posts (newest first) |
| `GET` | `/:id` | No | Get a single post |

### Comments — `/api/comments`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/post/:postId` | No | List comments for a post |
| `POST` | `/` | Yes | Create a root comment on a post |
| `POST` | `/reply` | Yes | Reply to an existing comment |
| `DELETE` | `/:id` | Yes | Soft-delete a comment (author only) |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/me` | Yes | Current user profile and credits |

### Example requests

**Signup**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Create post (protected)**
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Getting started with TypeScript",
  "body": "What resources would you recommend?"
}
```

**Reply to a comment (protected)**
```http
POST /api/comments/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great question!",
  "postId": "<postId>",
  "parentCommentId": "<commentId>"
}
```

---

## Authentication Flow

```
┌──────────┐     POST /signup or /login      ┌─────────────┐
│  Client  │ ──────────────────────────────► │ Auth Service│
└──────────┘                                   └──────┬──────┘
     ▲                                                │
     │                              bcrypt verify / hash
     │                                                ▼
     │                                         ┌─────────────┐
     │         { user, token }                 │  User Model │
     └──────────────────────────────────────── │  (MongoDB)  │
                                               └─────────────┘

Protected request:
┌──────────┐   Authorization: Bearer <JWT>   ┌──────────────┐
│  Client  │ ───────────────────────────────► │ protect      │
└──────────┘                                  │ middleware   │
                                              └──────┬───────┘
                                                     │ verifyToken()
                                                     │ load user → req.user
                                                     ▼
                                              ┌──────────────┐
                                              │  Controller  │
                                              └──────────────┘
```

1. **Signup** — Validates input, checks email uniqueness, creates user (password hashed in a Mongoose pre-save hook), returns JWT.
2. **Login** — Loads user with password field, compares via `comparePassword()`, returns JWT on success.
3. **Protected routes** — `protect` middleware extracts the Bearer token, verifies signature and expiry, loads the user, and attaches `{ id, name, email, credits }` to `req.user`.
4. **Errors** — Missing, invalid, or expired tokens return `401`. Deleted users return `401 User no longer exists`.

---

## Credit System

Credits incentivize meaningful discussion by rewarding post authors when others comment on their posts. Deeper replies award more credits.

### Formula

```
reward = firstTerm + (depth - 1) × commonDifference
```

This is an arithmetic progression where:
- `firstTerm` and `commonDifference` come from the `CreditConfig` collection
- On first application run, defaults are seeded from `CREDIT_FIRST_TERM` and `CREDIT_COMMON_DIFFERENCE` environment variables

### Example progression

With `firstTerm = 1` and `commonDifference = 2`:

| Depth | Calculation | Reward |
|-------|-------------|--------|
| 1 | 1 + (1 − 1) × 2 | **1 credit** |
| 2 | 1 + (2 − 1) × 2 | **3 credits** |
| 3 | 1 + (3 − 1) × 2 | **5 credits** |

Default environment values (`firstTerm = 10`, `commonDifference = 5`) produce rewards of 10, 15, 20, … at depths 1, 2, 3, …

### Award flow

1. User creates a comment → depth is calculated (1 for post replies, `parent.depth + 1` for nested replies)
2. `getCreditConfigOrCreateDefault()` reads config from MongoDB
3. `calculateReward()` computes the amount
4. Comment is saved with the `reward` field
5. OP's `credits` field is incremented via `$inc`

### Rollback flow

1. Comment author deletes their comment
2. Service verifies ownership
3. OP's credits are decremented by the stored `reward` value
4. Comment is marked `isDeleted = true` (record retained for audit consistency)

---

## Installation

**Prerequisites**
- Node.js 18+
- MongoDB running locally or a remote connection string

```bash
git clone <repository-url>
cd forum-backend
npm install
cp .env.example .env
# Edit .env with your values
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry (jsonwebtoken format) |
| `CREDIT_FIRST_TERM` | Yes | — | Initial `firstTerm` for credit config seed |
| `CREDIT_COMMON_DIFFERENCE` | Yes | — | Initial `commonDifference` for credit config seed |

Example `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/forum
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CREDIT_FIRST_TERM=10
CREDIT_COMMON_DIFFERENCE=5
```

---

## Running Locally

**Development** (hot reload with `tsx`):

```bash
npm run dev
```

**Production build**:

```bash
npm run build
npm start
```

Verify the server:

```bash
curl http://localhost:5000/health
# {"success":true,"message":"OK"}
```

---

## Future Frontend Integration

This API is designed to be consumed by a separate frontend (React, Next.js, Vue, etc.) without modification.

**Integration notes**

- Store the JWT from signup/login responses (e.g. in memory, `localStorage`, or an HTTP-only cookie managed by a BFF)
- Send `Authorization: Bearer <token>` on all protected requests
- Build the comment tree client-side using `parentCommentId` and `depth` from `GET /api/comments/post/:postId`
- Filter out comments where `isDeleted === true` when rendering threads
- Use `GET /api/users/me` for the user dashboard and credit display
- Public endpoints (`GET /api/posts`, `GET /api/posts/:id`, comment listing) require no authentication

**Suggested UI surfaces**

| Surface | Endpoints |
|---------|-----------|
| Auth pages | `POST /api/auth/signup`, `POST /api/auth/login` |
| Feed | `GET /api/posts` |
| Post detail + thread | `GET /api/posts/:id`, `GET /api/comments/post/:postId` |
| Create post | `POST /api/posts` |
| Comment / reply | `POST /api/comments`, `POST /api/comments/reply` |
| User dashboard | `GET /api/users/me` |

---

## Future Improvements

- Filter soft-deleted comments in the list endpoint
- Admin API to update `CreditConfig` without direct database access
- Pagination and sorting options for posts and comments
- Request rate limiting and security headers (e.g. Helmet)
- Input sanitization and stricter password policies
- Automated test suite (unit + integration)
- OpenAPI / Swagger documentation
- Docker Compose setup for local MongoDB + API

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express](https://expressjs.com/) | HTTP framework |
| [TypeScript](https://www.typescriptlang.org/) | Static typing |
| [MongoDB](https://www.mongodb.com/) | Document database |
| [Mongoose](https://mongoosejs.com/) | ODM / schema modeling |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT creation and verification |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [dotenv](https://github.com/motdotla/dotenv) | Environment configuration |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript execution (development) |

---
