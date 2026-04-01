# BK Nexoa Tech Attendance — Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Enter project name: `bk-nexoa-attendance`
4. Set a strong database password
5. Choose your region
6. Click **"Create new project"**

---

## Step 2: Get Your Project Credentials

1. In your project dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public key** (long JWT string)
3. Open `src/constants/index.js` and replace:
   ```js
   export const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
   ```

---

## Step 3: Run the Database Schema

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS TABLE ──────────────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  base_salary NUMERIC DEFAULT 0,
  bank_name TEXT,
  account_no TEXT,
  ifsc_code TEXT,
  branch_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SALARIES TABLE (MONTHLY RECORDS) ─────────────────────────────────────────
CREATE TABLE salaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL, -- 1 to 12
  year INTEGER NOT NULL,
  base_salary NUMERIC NOT NULL,
  absent_deduction NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  net_salary NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- ─── ATTENDANCE TABLE ─────────────────────────────────────────────────────────
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  location TEXT,
  check_in_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ─── REPORTS TABLE ────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_salaries_user_year_month ON salaries(user_id, year, month);
```

---

## Step 4: Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ─── USERS POLICIES ───────────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can insert new users
CREATE POLICY "Admins can delete employees"
  ON users FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow insert during signup
CREATE POLICY "Allow insert on signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── ATTENDANCE POLICIES ──────────────────────────────────────────────────────

-- Employees can view own attendance
CREATE POLICY "Employees view own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = user_id);

-- Admins view all attendance
CREATE POLICY "Admins view all attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Employees can check in/out
CREATE POLICY "Employees can manage own attendance"
  ON attendance FOR ALL
  USING (auth.uid() = user_id);

-- ─── REPORTS POLICIES ─────────────────────────────────────────────────────────

-- Employees view own reports
CREATE POLICY "Employees view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admins view all reports
CREATE POLICY "Admins view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Employees submit reports
CREATE POLICY "Employees can submit reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins update report status
CREATE POLICY "Admins can update report status"
  ON reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── SALARY POLICIES ──────────────────────────────────────────────────────────

-- Employees view own salary
CREATE POLICY "Employees view own salary"
  ON salaries FOR SELECT
  USING (auth.uid() = user_id);

-- Admins view all salaries
CREATE POLICY "Admins view all salaries"
  ON salaries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins manage all salaries
CREATE POLICY "Admins manage all salaries"
  ON salaries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Step 5: Create Supabase Storage Buckets

Go to **Storage** in your dashboard and create:

1. **Bucket: `avatars`**
   - Public: ✅
   - File size limit: 5MB

2. **Bucket: `report-files`**
   - Public: ✅
   - File size limit: 20MB

Then run these storage policies:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Avatar uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow public viewing of avatars
CREATE POLICY "Public avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload report files
CREATE POLICY "Report file uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-files' AND auth.role() = 'authenticated');

-- Allow public viewing of report files
CREATE POLICY "Public report files"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-files');
```

---

## Step 6: Enable Realtime

Go to **Database → Replication** and enable realtime for:
- `attendance` table
- `reports` table

---

## Step 7: Create Admin User

Option A — Via Supabase Dashboard:
1. Go to **Authentication → Users**
2. Click **"Invite user"** or **"New User"**
3. Create user with email/password
4. Then in SQL Editor, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
   ```

Option B — Via the signup screen in the app:
1. Register with "Admin" role using the role selector on the signup screen

---

## Step 8: Deploy to Vercel (Web)

```bash
npm install -g vercel
npx expo export --platform web
vercel deploy ./dist
```

## Step 9: Build APK (Android)

```bash
npx eas build --platform android --profile preview
```

## Step 10: Build iOS

```bash
npx eas build --platform ios --profile preview
```

---

## Environment Variables (for EAS builds)

Create `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

Create `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```
