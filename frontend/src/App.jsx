import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LearnerDashboardPage from './pages/LearnerDashboardPage'
import PreferencesPage from './pages/PreferencesPage'
import OnboardingQuizPage from './pages/OnboardingQuizPage'
import LessonPage from './pages/LessonPage'
import QuizPage from './pages/QuizPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import ProfileComparePage from './pages/ProfileComparePage'
import { useLearnerContext } from './context/LearnerContext'

function App() {
  const { currentLearner, loadLearners } = useLearnerContext()

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/learner/:learnerId"
            element={
              currentLearner ? <LearnerDashboardPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/learner/:learnerId/preferences"
            element={
              currentLearner ? <PreferencesPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/learner/:learnerId/quiz"
            element={
              currentLearner ? <OnboardingQuizPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/learner/:learnerId/lesson/:lessonId"
            element={
              currentLearner ? <LessonPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/learner/:learnerId/quiz/:conceptId"
            element={
              currentLearner ? <QuizPage /> : <Navigate to="/" replace />
            }
          />
          <Route path="/teacher" element={<TeacherDashboardPage />} />
          <Route path="/compare" element={<ProfileComparePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App