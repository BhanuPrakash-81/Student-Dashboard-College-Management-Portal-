<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database Setup (Supabase)

This project uses **Supabase (PostgreSQL)**.

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and create a new project.
   - Note down your database password.

2. **Get Connection String**:
   - In your project settings, go to **Database** -> **Connection String** -> **Node.js**.
   - Copy the connection string. It will look like:
     `postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

3. **Configure Environment**:
   - Create a `.env` file in the `backend` folder.
   - Add your connection string (replace `[password]` with your actual password):
     ```
     DATABASE_URL="postgres://postgres.xxxx:your_password@aws-0-region.pooler.supabase.com:6543/postgres"
     ```

4. **Initialize Database**:
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Open `backend/schema_supabase.sql` from this project.
   - Copy the SQL content and paste it into the Supabase SQL Editor.
   - Run the query to create the tables.

5. **Start Backend**:
   - `cd backend`
   - `npm install`
   - `npm start`
