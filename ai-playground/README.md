# AI Playground

A multi-modal AI-powered application for conversation analysis, image analysis, and document summarization.

## Features

- 🎙️ **Conversation Analysis**: Upload audio files for speech-to-text conversion and speaker diarization
- 🖼️ **Image Analysis**: Generate detailed descriptions and insights from images
- 📄 **Document Summarization**: Summarize PDFs, documents, and web content

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-playground
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local` and update the values:

   ```env
   NEXTAUTH_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

For demo purposes, use these credentials:

- **Email**: demo@example.com
- **Password**: password

## Project Structure

```
src/
├── app/
│   ├── auth/signin/         # Authentication pages
│   ├── dashboard/           # Main dashboard
│   ├── api/auth/           # NextAuth API routes
│   ├── globals.css         # Global styles with custom theme
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── providers.tsx       # Session provider wrapper
├── lib/
│   └── utils.ts           # Utility functions
└── auth.ts                # NextAuth configuration
```

## Deployment

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Cool Theme Features

- Custom blue/purple/cyan color scheme
- Dark mode support
- Gradient backgrounds and text
- Smooth animations and transitions
- Glassmorphism effects

## Development Notes

- Built with AI-first development using GitHub Copilot
- Clean architecture with proper separation of concerns
- TypeScript for type safety
- ESLint for code quality
- Responsive design principles

## Next Steps

The foundation is now ready for implementing the core AI features:

- Audio processing and diarization
- Image analysis with AI models
- Document processing and summarization
- User history and session management
