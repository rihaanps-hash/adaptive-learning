import { Outlet, Link, useLocation } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'

export default function Layout() {
  const location = useLocation()
  const { learners, currentLearner, selectLearner } = useLearnerContext()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/compare', label: 'Compare Profiles' },
    { path: '/teacher', label: 'Teacher Dashboard' },
  ]

  return (
    <>
      <header className="header" role="banner">
        <div className="container header-content">
          <Link to="/" className="logo" aria-label="Adaptive Learning Home">
            Adaptive Learning
          </Link>
          <nav className="nav" role="navigation" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                aria-current={location.pathname === link.path ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="main" role="main">
        <div className="container">
          {currentLearner && (
            <div className="learner-selector" role="group" aria-label="Select learner profile">
              {learners.map(learner => (
                <button
                  key={learner.id}
                  className={`learner-card ${currentLearner.id === learner.id ? 'selected' : ''}`}
                  onClick={() => selectLearner(learner.id)}
                  aria-pressed={currentLearner.id === learner.id}
                  aria-label={`Switch to ${learner.name}`}
                >
                  <div className="learner-card-name">{learner.name}</div>
                  <div className="learner-card-description">
                    Format: {learner.preferences.preferred_format} •
                    Pace: {learner.preferences.pacing} •
                    Text: {learner.preferences.text_size}
                  </div>
                </button>
              ))}
            </div>
          )}
          <Outlet />
        </div>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="container footer-content">
          <p className="footer-text">
            Adaptive Learning Platform — Hackathon MVP
          </p>
          <p className="footer-text">
            Built for accessibility and personalized learning
          </p>
        </div>
      </footer>
    </>
  )
}