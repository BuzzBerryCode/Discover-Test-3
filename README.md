# 🚀 Discover Page V4 - Creator Discovery Platform

A modern, responsive React-based discover page for creators, built with Vite, TypeScript, and Supabase.

## 🔒 Security Notice

**IMPORTANT**: This repository is configured for secure deployment. Never commit your actual `.env` file to version control.

## 🛠️ Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Discover-Test-3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual credentials:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Optional: Gemini API for AI features
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 4. Get Your Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy your Project URL and anon/public key

### 5. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | ✅ |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features | ❌ |

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📁 Project Structure

```
src/
├── app/                    # App routing
├── components/             # React components
│   ├── pages/             # Page components
│   ├── sections/          # Section components
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Library configurations
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔐 Security Features

- ✅ Environment variables properly configured
- ✅ `.env` file excluded from version control
- ✅ API keys secured in environment variables
- ✅ Client-side only Supabase configuration
- ✅ No hardcoded secrets in code

## 🛡️ Security Checklist

Before deploying to production:

- [ ] Environment variables set in hosting platform
- [ ] `.env` file not committed to repository
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] API keys rotated if previously exposed
- [ ] HTTPS enabled in production

## 📚 Documentation

- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) - Supabase integration details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.