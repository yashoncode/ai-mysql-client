# 🗄️ AI MySQL Client

A powerful, AI-enhanced web-based MySQL client built with React, Laravel, and Google Gemini AI. Connect to any MySQL database, explore schemas, execute queries, and get intelligent AI-powered insights.

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   React UI  │────▶│  Laravel API     │────▶│  Google Gemini AI │
│  (Port 3000)│◀────│  (Port 8000)     │◀────│  (Free Tier)      │
└─────────────┘     └────────┬─────────┘     └───────────────────┘
                             │
                    ┌────────┴─────────┐
                    │   MySQL Server   │
                    │  (Any database)  │
                    └──────────────────┘
```

## ✨ Features

- 🔌 **Universal MySQL Connection** — Connect to any MySQL server with custom credentials
- 🗂️ **Schema Explorer** — Visual tree view of tables, columns, types, and keys
- ⚡ **SQL Query Editor** — Monaco-based SQL editor with syntax highlighting
- 🤖 **Natural Language → SQL** — Describe what you want, AI generates the query
- 📊 **AI Result Analysis** — Automatic insights, findings, and chart suggestions
- 💬 **AI Chat Assistant** — Multi-turn conversation about your database
- 🔒 **Read-Only Safety** — Only SELECT/SHOW/DESCRIBE/EXPLAIN queries allowed
- 🐳 **Docker Ready** — Full Docker Compose setup for instant deployment

## 🚀 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (free)

## 📦 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ai-mysql-client
   ```

2. **Set up backend environment**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Add your Gemini API key** in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Install backend dependencies & generate key**
   ```bash
   docker-compose exec app composer install
   docker-compose exec app php artisan key:generate
   docker-compose exec app php artisan config:clear
   ```

6. **Open the app** at http://localhost:3000

7. **Connect to the bundled test database:**
   - Host: `mysql`
   - Port: `3306`
   - Database: `test_db`
   - Username: `testuser`
   - Password: `testpassword`

## 🔑 Getting a Free Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `backend/.env` as `GEMINI_API_KEY`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connect` | Connect to a MySQL database |
| GET | `/api/schema` | Get full database schema |
| POST | `/api/query` | Execute a SQL query |
| POST | `/api/ai/generate-sql` | Generate SQL from natural language |
| POST | `/api/ai/analyze` | Analyze query results with AI |
| POST | `/api/ai/chat` | Chat with AI about the database |

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Monaco Editor, Axios
- **Backend**: Laravel 11, PHP 8.3
- **AI**: Google Gemini 1.5 Flash (free tier)
- **Database**: MySQL 8.0
- **Cache/Session**: Redis
- **Proxy**: Nginx
- **Orchestration**: Docker Compose

## 🔒 Security Notes

- Credentials are encrypted in the session (never stored in plain text)
- Only read-only SQL queries are permitted (SELECT, SHOW, DESCRIBE, EXPLAIN)
- Gemini API key is server-side only, never exposed to the frontend
- Each request dynamically creates a new database connection

## 📄 License

MIT
