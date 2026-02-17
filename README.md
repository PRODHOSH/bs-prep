# IITM BS Learning Platform

A comprehensive learning platform for IIT Madras BS students with courses, mentoring, community support, and academic tools.

## Features

- 🎓 **Course Materials** - Access study materials and resources
- 🧮 **Academic Tools** - GPA Calculator and Predictor
- 👨‍🏫 **Mentoring System** - Connect with senior students
- 💬 **Community Support** - Engage with fellow students
- 📊 **Progress Tracking** - Monitor your academic performance
- ✨ **Modern UI** - Beautiful dark theme with animated backgrounds

## Tech Stack

- **Framework:** Next.js 16.0.10 (Turbopack)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Authentication:** Supabase Auth (with Google OAuth)
- **Database:** Supabase
- **Animations:** React Three Fiber (Beams background)
- **Font:** Urbanist (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IITMBSTamilCommunity/bsprep
cd iitm-bs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server (Turbopack)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard and protected routes
│   ├── support/           # Support/Contact forms
│   ├── tools/             # Academic tools (GPA Calculator, Predictor)
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── navbar.tsx         # Navigation bar
│   ├── footer.tsx         # Footer
│   └── beams-background.tsx  # Animated background
├── lib/                   # Utility functions
│   ├── gpa/               # GPA calculation utilities
│   └── supabase/          # Supabase client configs
└── public/                # Static assets

```

## Key Pages

- `/` - Homepage with hero section and features
- `/tools` - Academic tools landing page
- `/tools/gpa-calculator` - Course grade and semester GPA calculator
- `/tools/gpa-predictor` - Predict required exam scores
- `/support` - Contact form and feedback submission
- `/auth/login` - User authentication
- `/dashboard` - Protected student dashboard




## Contributing

This is a student-driven project. Contributions are welcome!

## Disclaimer

This platform is independently run by students and is not an official platform of IIT Madras or any IIT institution.

