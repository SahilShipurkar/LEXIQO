# Aptitude Test Practice Portal - Implementation Plan

## 1. Project Overview
A web-based portal for final-year students practice for placement exams.
- **Roles**: Admin, Student.
- **Key Features**: Practice Tests, Mock Tests, Analytics, RBAC.

## 2. Tech Stack
- **Backend**: NestJS (Node.js)
  - Database: PostgreSQL (via TypeORM or Prisma)
  - Auth: JWT, Passport, Role-Based Access Control (RBAC)
- **Frontend**: React (via Vite)
  - Styling: Custom CSS (Modern, Glassmorphism, Responsive)
  - State Management: Context API or Zustand
- **DevOps**: Docker Compose (for local Postgres DB)

## 3. Database Schema (Draft)
### Users
- id, name, email, password_hash, role (student/admin), created_at

### Categories
- id, name (Quant, Logical, etc.), description

### Questions
- id, text, options (json), correct_option, difficulty (Easy, Medium, Hard), category_id, time_limit (derived from difficulty or manual), is_most_asked (boolean)

### Tests
- id, user_id, status (ongoing, completed), score, total_questions, time_taken, started_at, completed_at

### TestAttempts (for detailed analytics)
- id, test_id, question_id, user_answer, is_correct, time_spent

## 4. Phase-wise Implementation
1. **Setup**: Initialize NestJS backend and Vite Frontend. Setup Docker for Postgres.
2. **Backend Core**: Auth Module, Database connection.
3. **Database Design**: Entities and Relationships.
4. **Backend Features**: Question Management (Admin), Test Logic (taking a test).
5. **Frontend Core**: Basic Layout, Authentication UI.
6. **Frontend Features**: Dashboard, Test Interface (Timer, Options), Result Analysis.
7. **Polish**: UI/UX improvements, Animations, Mobile responsiveness.

## 5. Next Steps
1. Initialize project structure.
2. Set up PostgreSQL container.
3. specific NextJS/React installation.
