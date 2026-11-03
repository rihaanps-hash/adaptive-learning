import { Link } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'

export default function HomePage() {
  const { learners, loading, error } = useLearnerContext()

  if (loading) {
    return (
      <div className="loading" role="status" aria-label="Loading learner profiles">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading learner profiles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
        <button className="btn btn-primary" style={{marginTop: 'var(--spacing-md)'}} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <section aria-labelledby="home-title">
        <h1 id="home-title" className="page-title">Welcome to Adaptive Learning</h1>
        <p className="page-subtitle">
          A personalized learning platform that adapts lesson content, pacing, difficulty, and format 
          to each learner's stated preferences and demonstrated understanding.
        </p>
      </section>

      <section aria-labelledby="features-title" className="section">
        <h2 id="features-title" className="section-title">Key Features</h2>
        <div className="grid grid-3">
          <article className="card">
            <h3 className="card-title">Personalized Preferences</h3>
            <ul className="checklist">
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Preferred format: text, audio, visual steps, or combined
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Adjustable text size and contrast modes
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Reading complexity: simple, standard, or advanced
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Pacing: slower, standard, or faster
              </li>
            </ul>
          </article>
          <article className="card">
            <h3 className="card-title">Adaptive Learning Engine</h3>
            <ul className="checklist">
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Bayesian Knowledge Tracing for concept mastery
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Real-time difficulty adjustment
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Content simplification preserving key facts
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Visual step-by-step breakdowns
              </li>
            </ul>
          </article>
          <article className="card">
            <h3 className="card-title">Teacher Dashboard</h3>
            <ul className="checklist">
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Concept-level mastery tracking
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Recent quiz results history
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Learner preference overview
              </li>
              <li className="checklist-item">
                <span aria-hidden="true">✓</span>
                Suggested next steps per learner
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="demo-title" className="section">
        <h2 id="demo-title" className="section-title">Demo Learner Profiles</h2>
        <p className="section-subtitle">
          Select a profile to experience how the same lesson adapts differently based on preferences and performance.
        </p>
        <div className="grid grid-2">
          {learners.map(learner => (
            <Link
              key={learner.id}
              to={`/learner/${learner.id}`}
              className="card"
              style={{textDecoration: 'none', color: 'inherit', display: 'block'}}
            >
              <h3 className="card-title">{learner.name}</h3>
              <dl style={{display: 'grid', gap: 'var(--spacing-sm)'}}>
                <dt style={{fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>
                  Preferred Format
                </dt>
                <dd>
                  <span className="badge badge-primary">{learner.preferences.preferred_format}</span>
                </dd>
                <dt style={{fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>
                  Text Size
                </dt>
                <dd>
                  <span className="badge badge-outline">{learner.preferences.text_size}</span>
                </dd>
                <dt style={{fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>
                  Contrast
                </dt>
                <dd>
                  <span className="badge badge-outline">{learner.preferences.contrast_mode}</span>
                </dd>
                <dt style={{fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>
                  Reading Complexity
                </dt>
                <dd>
                  <span className="badge badge-outline">{learner.preferences.reading_complexity}</span>
                </dd>
                <dt style={{fontWeight: 500, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>
                  Pacing
                </dt>
                <dd>
                  <span className="badge badge-outline">{learner.preferences.pacing}</span>
                </dd>
              </dl>
              <div style={{marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)'}}>
                <button className="btn btn-primary" style={{width: '100%'}}>
                  Start Learning
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="teacher-title" className="section">
        <h2 id="teacher-title" className="section-title">For Teachers</h2>
        <Link to="/teacher" className="btn btn-secondary" style={{display: 'inline-block'}}>
          View Teacher Dashboard
        </Link>
      </section>
    </div>
  )
}