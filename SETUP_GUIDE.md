# LEXIQO Project - Complete Setup & Run Guide (From Scratch)

This document provides a comprehensive, step-by-step guide to setting up and running the **LEXIQO** application on a new laptop/machine from scratch. 

Follow these steps in order to install dependencies, set up the PostgreSQL database, configure environment variables, and get the frontend and backend servers running.

---

## 🛠️ Step 1: Install Prerequisites

Before starting, make sure the following software is installed on the laptop:

1. **Node.js (LTS Version)**
   - Download and install Node.js (v18 or v20+) from [nodejs.org](https://nodejs.org/).
   - To verify installation, run in your terminal:
     ```bash
     node -v
     npm -v
     ```

2. **PostgreSQL Database**
   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
   - During installation, set a master password for the default `postgres` user (e.g., `postgres123` or your choice). Keep note of this password.
   - Install **pgAdmin 4** (usually bundled with PostgreSQL) to manage the database visually.

3. **Git (Optional but recommended)**
   - Download from [git-scm.com](https://git-scm.com/) if you want to clone/pull the repository.

---

## 🗄️ Step 2: Create the Database in PostgreSQL

You must create a PostgreSQL database named `aptitude` (or whichever name you configure in your backend `.env` file) before running the project.

### Option A: Using pgAdmin 4 (Graphical Interface)
1. Open **pgAdmin 4** from your applications.
2. Enter your master password to unlock the server.
3. In the left panel, expand **Servers** > **PostgreSQL [version]**.
4. Right-click on **Databases** and select **Create** > **Database...**.
5. Enter **`aptitude`** as the Database name.
6. Click **Save**.

### Option B: Using SQL Shell (psql)
1. Open the PostgreSQL terminal (`psql`) or your command line.
2. Log in using the username `postgres` and your password.
3. Run the following command:
   ```sql
   CREATE DATABASE aptitude;
   ```

---

## 📁 Step 3: Project Structure & File Prep

Unzip the project file. The folder structure should look like this:
```text
LEXIQO/
├── backend/            # NestJS Backend API
│   ├── prisma/         # Prisma Schema & Migrations
│   ├── src/            # Source Code
│   ├── .env.example    # Backend Environment Template
│   └── package.json
├── frontend/           # React/Vite Frontend
│   ├── src/            # React Code
│   ├── .env.example    # Frontend Environment Template
│   └── package.json
└── SETUP_GUIDE.md      # This guide
```

---

## 🔑 Step 4: Configure Backend Environment Variables (`.env`)

1. In the `backend` folder, create a new file named **`.env`** (you can copy and rename `.env.example`).
2. Open **`backend/.env`** in a text editor and update/configure the variables:

```env
# Database Credentials
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password   # Replace with your PostgreSQL password
DB_NAME=aptitude

# Main Database Connection String for Prisma
# Format: postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/aptitude?schema=public"

# Token Secret Keys (For Session Signatures)
JWT_SECRET=secretKey
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=refreshSecretKey
REFRESH_TOKEN_EXPIRES_IN=7d
BACKEND_URL=http://localhost:3000

# --- Email Settings for OTP (Real Gmail SMTP or Sandbox) ---
# Refer to Step 7 for generating the EMAIL_PASS for Gmail.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# --- Google Authentication Keys ---
# Refer to Step 8 for obtaining these keys.
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## ⚙️ Step 5: Backend Setup & Run

Now open your terminal/command prompt and run the following commands:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Run Prisma Migrations** (This will automatically create all required tables and schemas in your newly created `aptitude` database):
   ```bash
   npx prisma migrate dev --name init
   ```
   *(If prompted that a database change will happen or to reset, type `y` and press enter).*

4. **Seed Database Data** (This will populate practice test questions, categories, and coding challenges):
   ```bash
   npm run seed
   ```
   *(You should see output indicating that seeding finished successfully).*

5. **Start the backend server:**
   ```bash
   npm run start:dev
   ```
   The backend will start running on **`http://localhost:3000`**.

---

## 💻 Step 6: Frontend Setup & Run

1. In the `frontend` folder, create a new file named **`.env`** (or copy and rename `.env.example`).
2. Open **`frontend/.env`** and update the variables:

```env
# Point to your local NestJS backend
VITE_API_URL=http://localhost:3000

# Google Client ID (Must match the one in backend/.env)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

3. Open a **new terminal window**, and run the following commands:

   **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

   **Install frontend dependencies:**
   ```bash
   npm install
   ```

   **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will start running on **`http://localhost:5173`** (or a similar port printed in the terminal). Open this URL in your web browser!

---

## ✉️ Step 7: Configuring Email OTP Verification

When a user signs up or requests an OTP, the application generates a 6-digit code. You have two options to run and test this feature:

### Option A: Read OTP from Terminal Console (Quick Development Shortcut)
If you do not want to set up an email server immediately:
1. You can leave the `EMAIL_USER` and `EMAIL_PASS` settings in `backend/.env` empty or set to dummy values.
2. When you perform an OTP-requiring action on the frontend (like registration or login), the backend will print the OTP directly into the **backend terminal window** like this:
   ```text
   ====================================================
   🔒 [DEV MODE] New OTP for user@example.com: 582910
   ====================================================
   ```
3. Simply read the code from your terminal, type it into the frontend input, and it will authenticate successfully!

---

### Option B: Real Email Dispatch (Using Gmail SMTP)
To have the application send real OTP emails to users:
1. Log into your Google Account (the email you configured as `EMAIL_USER`).
2. Go to **Security Settings** and ensure **2-Step Verification** is turned **ON**.
3. Go to **App Passwords** ([https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create a new App Password:
   - Enter an app name (e.g., `LEXIQO Backend`).
   - Click **Create**.
   - Copy the generated 16-character code (looks like `abcd efgh ijkl mnop`).
5. Open your `backend/.env` file and replace `EMAIL_PASS` with this code (**without spaces**):
   ```env
   EMAIL_PASS=abcdefghijklmnop
   ```
6. Restart the backend server. The app will now dispatch real emails.

---

## 🌐 Step 8: Configuring Google OAuth Login

To enable the "Login with Google" button on the login screen, you must register a project on the Google Cloud Console.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Lexiqo Auth`).
3. Search for **OAuth Consent Screen** in the search bar:
   - Choose **External** user type.
   - Fill in the required fields (App name, support email, developer contact email).
   - Click **Save and Continue** through the scopes and test users sections.
4. Go to the **Credentials** page in the left menu:
   - Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
   - For **Application type**, choose **Web application**.
   - Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
     - `http://localhost:5173` (Frontend address)
     - `http://localhost:3000` (Backend address)
   - Under **Authorized redirect URIs**, click **+ ADD URI** and add:
     - `http://localhost:3000/auth/google/callback`
   - Click **Create**.
5. Copy your **Client ID** and **Client Secret** from the modal that appears.
6. Paste them into the config files:
   - **`backend/.env`**:
     ```env
     GOOGLE_CLIENT_ID=your-copied-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-copied-client-secret
     ```
   - **`frontend/.env`**:
     ```env
     VITE_GOOGLE_CLIENT_ID=your-copied-client-id.apps.googleusercontent.com
     ```
7. Restart both backend and frontend servers. Google Login will now function.

---

## 🚀 Step 9: Verify Everything is Working

To verify your installation:
1. Open `http://localhost:5173` in your browser.
2. Click **Sign Up** and create an account using your email.
3. Retrieve the OTP either from your real email inbox (if Option B is set up) or from your NestJS backend terminal window (if Option A is used).
4. Enter the OTP, verify your account, and sign in.
5. Navigate to the Practice Quiz or Coding Challenge pages to ensure categories and questions loaded from the seed database are displaying correctly.
