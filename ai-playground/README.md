# 🚀 AI Playground

A comprehensive AI-powered application featuring conversation analysis, image analysis, and document summarization using Google's Gemini 2.5 Flash API.

## 🌟 Live Demo

**🔗 [https://plivo-assignment-omega.vercel.app/](https://plivo-assignment-omega.vercel.app/)**

### Demo Credentials

- **Email:** `nishanthdipali@gmail.com`
- **Password:** `Password@123`

## 📋 Project Overview

AI Playground is a modern web application built with Next.js 15 that provides three powerful AI-driven features:

### 🎙️ **1. Conversation Analysis**

- **Audio upload** with drag & drop support
- **Speaker diarization** without relying on STT vendor capabilities
- **Comprehensive transcription** with speaker identification
- **AI-powered insights** including summary, key topics, and sentiment analysis
- **Timestamp tracking** for each speaker segment

### 🖼️ **2. Image Analysis**

- **Image upload** with instant preview
- **Detailed AI descriptions** using Gemini 2.5 Flash
- **Visual content analysis** with comprehensive insights
- **Copy-to-clipboard** functionality for easy sharing
- **Multiple format support** (JPEG, PNG, WebP, etc.)

### 📄 **3. Document & URL Summarization**

- **Document processing** for PDF, DOC, DOCX, TXT, and Markdown files
- **Web content analysis** for any publicly accessible URL
- **Complex document handling** including tables, charts, and images
- **Comprehensive summaries** with key points, topics, and action items
- **Download reports** as text files
- **Metadata extraction** including author, publish date, and language detection

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Authentication:** Supabase Auth with SSR
- **AI Model:** Google Gemini 2.5 Flash (Free Tier)
- **Database:** Supabase PostgreSQL
- **Deployment:** Vercel
- **Development:** Turbopack for fast hot reload

## ✨ Key Features

### 🔐 **Authentication System**

- **Secure signup/login** with Supabase
- **Server-side rendering** (SSR) support
- **Protected routes** with middleware
- **Session management** with automatic token refresh

### 🎨 **Modern UI/UX**

- **Responsive design** works on all devices
- **Beautiful gradients** with theme consistency
- **Smooth animations** and transitions
- **Drag & drop** file uploads
- **Real-time feedback** during processing

### 🧠 **AI-Powered Analysis**

- **Gemini 2.5 Flash integration** for all features
- **Smart content extraction** from various file formats
- **Fallback mechanisms** for robust error handling
- **JSON response parsing** with validation

### 📊 **Rich Results Display**

- **Interactive dashboards** for each analysis type
- **Copy functionality** for easy sharing
- **Download capabilities** for reports
- **Structured data presentation** with charts and metrics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google AI (Gemini) API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lorstenoplo/plivo-assignment.git
   cd ai-playground
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase**

   - Create a new project in [Supabase](https://supabase.com)
   - Enable authentication in the dashboard
   - Configure email authentication
   - Copy your project URL and anon key to `.env.local`

5. **Get Gemini API Key**

   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Add it to your `.env.local` file

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
ai-playground/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── conversation-analysis/    # Conversation analysis feature
│   │   ├── image-analysis/          # Image analysis feature
│   │   ├── document-summarization/  # Document summarization feature
│   │   ├── api/                     # API routes
│   │   │   ├── analyze-conversation/
│   │   │   ├── analyze-image/
│   │   │   ├── analyze-document/
│   │   │   └── analyze-url/
│   │   ├── auth/                    # Authentication pages
│   │   └── dashboard/               # Main dashboard
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Shadcn UI components
│   │   ├── audio-upload.tsx
│   │   ├── image-upload.tsx
│   │   └── document-upload.tsx
│   ├── contexts/                    # React contexts
│   │   └── auth.tsx                 # Authentication context
│   ├── lib/                         # Utilities
│   │   └── supabase/                # Supabase configuration
│   └── utils/                       # Helper functions
├── public/                          # Static assets
└── README.md
```

## 🔧 API Endpoints

### Conversation Analysis

- **POST** `/api/analyze-conversation`
- **Input:** Audio file (base64)
- **Output:** Transcription, speakers, summary, topics, sentiment

### Image Analysis

- **POST** `/api/analyze-image`
- **Input:** Image file (base64)
- **Output:** Detailed description, objects, scene analysis

### Document Analysis

- **POST** `/api/analyze-document`
- **Input:** Document file (base64)
- **Output:** Summary, key points, topics, metadata

### URL Analysis

- **POST** `/api/analyze-url`
- **Input:** Website URL
- **Output:** Content summary, structure analysis, key insights

## 🎯 Features in Detail

### Conversation Analysis

- **Multi-format support:** MP3, WAV, M4A, OGG
- **Speaker separation:** Up to 2 speakers automatically detected
- **Timestamp precision:** Accurate start/end times for each segment
- **Smart analysis:** Topics, sentiment, and key discussion points
- **Export functionality:** Download transcriptions as text files

### Image Analysis

- **Visual understanding:** Object detection, scene recognition
- **Detailed descriptions:** Comprehensive AI-generated descriptions
- **Multiple perspectives:** Technical and creative analysis modes
- **Instant preview:** Real-time image preview with analysis overlay

### Document Summarization

- **Format versatility:** PDF, Word, Text, Markdown support
- **Structure analysis:** Sections, tables, images, links detection
- **Smart extraction:** Author, date, language auto-detection
- **Action items:** Automatic identification of tasks and recommendations
- **Quote extraction:** Key memorable passages highlighted

## 🔒 Security Features

- **Server-side authentication** with Supabase
- **Protected API routes** with session validation
- **File type validation** to prevent malicious uploads
- **Rate limiting** considerations for API calls
- **Environment variable protection** for sensitive keys

## 🚀 Deployment

The application is deployed on Vercel with the following configuration:

1. **Automatic deployments** from the main branch
2. **Environment variables** configured in Vercel dashboard
3. **Build optimization** with Next.js 15 features
4. **Edge runtime** for optimal performance

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lorstenoplo/plivo-assignment)

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for authentication and database
- **Vercel** for hosting and deployment
- **Shadcn/ui** for beautiful UI components
- **Next.js** team for the amazing framework

## 📞 Support

If you have any questions or need help:

- **Email:** nishanthdipali@gmail.com
- **GitHub Issues:** [Create an issue](https://github.com/lorstenoplo/plivo-assignment/issues)
- **Live Demo:** [https://plivo-assignment-omega.vercel.app/](https://plivo-assignment-omega.vercel.app/)

---

**Built with ❤️ using Next.js 15, TypeScript, and Google Gemini AI**
