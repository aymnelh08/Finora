# Finora

AI-powered financial SaaS for Moroccan SMEs.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Storage)
- **AI**: OpenAI GPT-4o
- **Styling**: Custom Design System (Navy, Jade, Onyx, Aero)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Go to the SQL Editor and run the contents of `supabase/schema.sql`.
   - Copy your Project URL and Anon Key.

3. **Configure Environment**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure
- `app/`: Next.js App Router pages and layout.
- `components/ui/`: Reusable design system components.
- `components/layout/`: Sidebar, Header, etc.
- `supabase/`: Database schema and migration files.
- `lib/`: Utilities and helpers.

## Design System
- **Navy (#001F54)**: Primary brand color.
- **Jade (#00A36C)**: Success and actions.
- **Onyx (#0A0A0A)**: Backgrounds and text.
- **Aero (#C9D6FF)**: Accents and highlights.
