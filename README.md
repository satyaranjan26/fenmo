# Expense Tracker

A minimal, full-stack personal finance tool built with Next.js, Prisma, and SQLite.

## Overview

This application allows users to record and review personal expenses. It is designed with production-like quality in mind, focusing on correctness, money handling, and resilience under real-world conditions like network retries.

## Features

- **Create Expenses**: Add new expenses with amount, category, description, and date.
- **View Expenses**: See a list of all recorded expenses.
- **Filter & Sort**: Filter by category and sort by newest/oldest first.
- **Dynamic Summary**: View the total amount of the currently visible expenses.
- **Idempotent Submissions**: Safely handles double-clicks and network retries.
- **Premium UI**: Uses Vanilla CSS with CSS Modules for a sleek, responsive, glassmorphism-inspired design.

## Key Design Decisions & Trade-offs

### 1. Money Handling (Cents instead of Decimals)
**Decision**: Amounts are stored in the database as `Int` (cents) rather than floating-point decimals.
**Reasoning**: JavaScript (and SQLite's real numbers) are prone to floating-point precision errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). By converting `₹10.50` into `1050` cents on the backend and storing it as an integer, we guarantee exact arithmetic. The frontend handles formatting it back to a readable currency string.

### 2. Idempotency for Network Retries
**Decision**: The frontend generates a unique UUID (`idempotencyKey`) when the user first submits the form.
**Reasoning**: In real-world conditions, users might double-click the submit button, or a spotty network connection might cause the browser to retry the POST request. The `idempotencyKey` is marked as `@unique` in the database. If the backend receives a duplicate key, it safely returns the existing record instead of creating a duplicate charge.

### 3. Tech Stack: Next.js + SQLite
**Decision**: Used Next.js App Router for both the frontend and the backend API (`/api/expenses`). SQLite is used for persistence.
**Reasoning**: Next.js provides a clean, unified repository structure. SQLite is a robust, zero-configuration relational database perfect for a small tool while still offering real query capabilities (sorting/filtering) compared to a flat JSON file.

### 4. Styling: Vanilla CSS Modules
**Decision**: Used standard CSS Modules with CSS variables instead of Tailwind or component libraries.
**Reasoning**: Ensures full control over the design system, creating a custom premium look with micro-animations without heavy dependencies.

## Intentionally Not Done (Timebox Trade-offs)

- **User Authentication**: Skipped to focus on core expense logic.
- **Pagination**: The API currently returns all filtered records. For a massive dataset, pagination would be required.
- **Advanced Summaries**: Only a simple total is displayed. A chart showing category breakdowns was skipped to prioritize core features and correctness.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   This will create a local SQLite database (`dev.db`).
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Deploy

The application is built to be easily deployed to Vercel.

1. **Push to GitHub**: Commit the repository and push to GitHub.
2. **Deploy to Vercel**: 
   - Create a new project on Vercel and import the GitHub repository.
   - Vercel automatically detects Next.js and will configure the build settings.
3. **Database Considerations**: 
   - Since this uses SQLite, the database file will not persist across serverless function invocations on Vercel. 
   - **For true production deployment**: You should change the `provider` in `prisma/schema.prisma` to `"postgresql"` or `"mysql"` and provide a `DATABASE_URL` to a hosted database (like Supabase, Neon, or PlanetScale).

## Automated Tests
A basic test file was created to verify money formatting logic. 
In a real production environment, this would be expanded using tools like Jest or Playwright.
