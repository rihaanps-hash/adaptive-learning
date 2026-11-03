# Adaptive Learning Platform

A personalized learning platform that adapts lesson content, pacing, difficulty, and format to each learner's stated preferences and demonstrated understanding. Built as a hackathon MVP demonstrating adaptive learning for students with disabilities.

## Features

- **Learner Preferences**: Choose preferred format (text, audio, visual, combined), text size, contrast, reading complexity, and pacing
- **Onboarding Quiz**: Bayesian Knowledge Tracing estimates starting knowledge
- **Adaptive Lessons**: Content adapts in real-time based on preferences and mastery
- **Practice Questions**: Answers update concept mastery and affect future adaptations
- **Teacher Dashboard**: View progress, mastery, quiz history, and recommendations for all learners
- **Profile Comparison**: Side-by-side view of how the same lesson adapts for different learners
- **Accessibility**: Keyboard navigation, screen reader support, high contrast, scalable text

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: FastAPI (Python)
- **Styling**: Custom CSS with CSS variables for theming

## Project Structure

```
adaptive-learning/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI application
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── context/         # React context providers
    │   ├── pages/           # Page components
    │   ├── App.jsx          # Main app with routing
    │   ├── main.jsx         # Entry point
    │   └── styles.css       # Global styles
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

## Quick Start

### 1. Start the Backend

```bash
cd adaptive-learning/backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```

The backend will run at `http://localhost:8000`

### 2. Start the Frontend

```bash
cd adaptive-learning/frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:3000`

### 3. Open the App

Visit `http://localhost:3000` in your browser.

## Demo Walkthrough

### 1. Home Page
- View two demo learner profiles: **Alex** (visual learner, simpler language, slower pace) and **Jordan** (audio learner, advanced language, faster pace)
- Click "Start Learning" on either profile

### 2. Learner Dashboard
- See overall progress and concept mastery
- Click "View Lesson" to see the adapted lesson
- Click "Edit Preferences" to customize the experience

### 3. Preferences Page
- Adjust format, text size, contrast, complexity, pacing
- See live preview of how changes affect content
- Changes apply immediately

### 4. Onboarding Quiz
- 5 questions covering all lesson concepts
- Results initialize Bayesian Knowledge Tracing mastery estimates
- Mastery affects lesson difficulty

### 5. Adaptive Lesson
- **Alex** sees: Simplified language, large text, high contrast, visual step-by-step breakdowns, slower pacing
- **Jordan** sees: Advanced vocabulary, standard text, audio playback available, faster pacing, more challenging practice
- Navigate through 3 lesson segments
- Click "Practice This Concept" to test understanding

### 6. Practice Quiz
- Concept-specific questions
- Answers update mastery in real-time
- Feedback explains correct/incorrect answers

### 7. Teacher Dashboard
- View both learners side-by-side
- Click a learner card for detailed view
- See concept mastery, quiz history, preferences, and recommendations

### 8. Profile Comparison
- Select up to 3 profiles (2 demo profiles available)
- Navigate through lesson sections
- See side-by-side adapted content
- View adaptation explanations for each profile

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/learners` | List all learners |
| GET | `/api/learners/{id}` | Get learner profile |
| PUT | `/api/learners/{id}/preferences` | Update preferences |
| GET | `/api/lesson/{id}` | Get base lesson |
| GET | `/api/lesson/{id}/adapted/{learnerId}` | Get adapted lesson |
| GET | `/api/quiz/{conceptId}` | Get quiz questions |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/teacher/dashboard` | Teacher dashboard data |

## Demo Data

Two fictional learner profiles are seeded:

1. **Alex (Visual Learner, Needs Simpler Language)**
   - Format: Visual steps
   - Text size: Large
   - Contrast: High
   - Complexity: Simple
   - Pacing: Slower
   - Initial mastery: Low (0.1-0.4)

2. **Jordan (Audio Learner, Faster Pace)**
   - Format: Audio
   - Text size: Medium
   - Contrast: Normal
   - Complexity: Advanced
   - Pacing: Faster
   - Initial mastery: High (0.6-0.8)

## Sample Lesson

"Understanding Photosynthesis" with 3 concepts:
1. What is Photosynthesis
2. The Photosynthesis Equation
3. Stages of Photosynthesis

Each concept has original content, visual steps, and adaptive variants.

## Accessibility Features

- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Visible focus indicators
- High contrast mode
- Scalable text (4 sizes)
- Screen reader compatible
- Reduced motion support
- Text-to-speech via Web Speech API
- Color not used as sole information carrier

## Limitations

- **In-memory storage**: Data resets on server restart (no database)
- **Single lesson**: Only one sample lesson included
- **No authentication**: Demo profiles only
- **Simple BKT**: Basic Bayesian Knowledge Tracing with fixed parameters
- **Local TTS only**: Uses browser's built-in speech synthesis
- **No LLM integration**: Text simplification uses rule-based replacement
- **Fixed quiz questions**: 6 practice questions total

## Future Enhancements

- Database persistence (PostgreSQL/SQLite)
- User authentication and accounts
- Multiple lessons and curriculum
- LLM-powered content adaptation (optional)
- More sophisticated BKT with per-concept parameters
- Offline support with service workers
- Mobile app version
- Analytics and reporting

## Deployment

### Quick Deploy (Frontend → Vercel, Backend → Railway)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
# Create repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/adaptive-learning.git
git push -u origin main

# 2. Deploy Backend to Railway
cd backend
npm install -g @railway/cli
railway login && railway init && railway up
# Save the Railway URL (e.g., https://xxx.up.railway.app)

# 3. Deploy Frontend to Vercel
cd ../frontend
npm install -g vercel
vercel
# Add VITE_API_URL in Vercel Dashboard → Settings → Environment Variables
# Value: https://your-railway-url.up.railway.app

# 4. Redeploy Frontend
vercel --prod
```

See [DEPLOY.md](DEPLOY.md) for detailed instructions and alternative hosting options.

## License

MIT License - Hackathon MVP