import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'
import { api } from '../lib/api'

export default function LessonPage() {
  const { learnerId, lessonId } = useParams()
  const { currentLearner, updateLearner } = useLearnerContext()
  const navigate = useNavigate()

  const learner = currentLearner?.id === learnerId ? currentLearner : null

  const [lesson, setLesson] = useState(null)
  const [adaptedSegments, setAdaptedSegments] = useState([])
  const [explanations, setExplanations] = useState([])
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(null)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true)
        const data = await api.getAdaptedLesson(lessonId, learnerId)
        setLesson(data.lesson)
        setAdaptedSegments(data.adapted_segments)
        setExplanations(data.explanations)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (learner) {
      fetchLesson()
    }
  }, [learnerId, lessonId, learner])

  const speakText = (text, segmentId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = learner.preferences.pacing === 'slower' ? 0.8 :
                       learner.preferences.pacing === 'faster' ? 1.2 : 1.0
      utterance.onstart = () => setAudioPlaying(segmentId)
      utterance.onend = () => setAudioPlaying(null)
      utterance.onerror = () => setAudioPlaying(null)
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Text-to-speech is not supported in this browser.')
    }
  }

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setAudioPlaying(null)
    }
  }

  if (!learner) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Learner profile not found.</p>
        <Link to="/" className="btn btn-primary" style={{marginTop: '16px'}}>
          Go Home
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading" role="status" aria-label="Loading lesson">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading your personalized lesson...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Error loading lesson: {error}</p>
        <button className="btn btn-primary" style={{marginTop: '16px'}} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (!lesson || adaptedSegments.length === 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon" aria-hidden="true">📚</div>
        <h2>No lesson content available</h2>
      </div>
    )
  }

  const currentSegment = adaptedSegments[currentSegmentIndex]
  const concept = lesson.concepts.find(c => c.id === currentSegment.concept_id)
  const mastery = (learner.concept_mastery && learner.concept_mastery[currentSegment.concept_id]) || 0
  const conceptName = concept ? concept.name : currentSegment.concept_id
  const isLastSegment = currentSegmentIndex === adaptedSegments.length - 1
  const nextButtonLabel = isLastSegment ? 'Finish Lesson' : 'Next Section'
  const nextAriaLabel = isLastSegment ? 'Finish lesson' : 'Next section'

  const handleNextSegment = () => {
    if (currentSegmentIndex < adaptedSegments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1)
      stopAudio()
    } else {
      navigate('/learner/' + learnerId)
    }
  }

  const handlePrevSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1)
      stopAudio()
    }
  }

  const handlePractice = () => {
    navigate('/learner/' + learnerId + '/quiz/' + currentSegment.concept_id)
  }

  return (
    <div>
      <section aria-labelledby="lesson-title">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px'}}>
          <div>
            <h1 id="lesson-title" className="page-title">{lesson.title}</h1>
            <p className="page-subtitle">{lesson.description}</p>
          </div>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <Link to={'/learner/' + learnerId} className="btn btn-outline">
              Dashboard
            </Link>
            <Link to={'/learner/' + learnerId + '/preferences'} className="btn btn-outline">
              Preferences
            </Link>
          </div>
        </div>
      </section>

      {explanations.length > 0 && (
        <div className="explanation-banner" role="region" aria-label="Adaptation explanations">
          <div className="explanation-title">Why this lesson looks different for you:</div>
          <ul className="explanation-list">
            {explanations.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(((currentSegmentIndex + 1) / adaptedSegments.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress" style={{marginBottom: '24px'}}>
        <div className="progress-fill" style={{width: ((currentSegmentIndex + 1) / adaptedSegments.length) * 100 + '%'}}></div>
      </div>
      <p style={{textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '24px'}}>
        Section {currentSegmentIndex + 1} of {adaptedSegments.length}: {conceptName}
      </p>

      <article className="card lesson-content" aria-labelledby="segment-title">
        <header style={{marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)'}}>
          <h2 id="segment-title" style={{fontSize: '1.5rem', marginBottom: '8px'}}>
            {conceptName}
          </h2>
          <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
            <span className={mastery < 0.4 ? 'badge badge-danger' : mastery < 0.7 ? 'badge badge-warning' : 'badge badge-secondary'}>
              Mastery: {Math.round(mastery * 100)}%
            </span>
            <span className="badge badge-outline">Difficulty: {currentSegment.difficulty}</span>
            <span className="badge badge-outline">Pacing: {learner.preferences.pacing}</span>
          </div>
        </header>

        {learner.preferences.preferred_format === 'audio' || learner.preferences.preferred_format === 'combined' ? (
          <div className="audio-player" role="region" aria-label="Audio playback">
            <button
              className="audio-player-btn"
              onClick={() => audioPlaying === currentSegment.id ? stopAudio() : speakText(currentSegment.adapted_content || currentSegment.original_content, currentSegment.id)}
              disabled={!('speechSynthesis' in window)}
              aria-label={audioPlaying === currentSegment.id ? 'Stop audio' : 'Play audio'}
              aria-pressed={audioPlaying === currentSegment.id}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {audioPlaying === currentSegment.id ? (
                  <>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </>
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </button>
            <div className="audio-player-progress" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Audio progress">
              <div className="audio-player-progress-fill" style={{width: '0%'}}></div>
            </div>
            <span style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>
              {'speechSynthesis' in window ? 'Click to listen' : 'Audio not available in this browser'}
            </span>
          </div>
        ) : null}

        <div dangerouslySetInnerHTML={{__html: (currentSegment.adapted_content || currentSegment.original_content).replace(/\n/g, '<br>')}} />

        {learner.preferences.preferred_format === 'visual' || learner.preferences.preferred_format === 'combined' ? (
          currentSegment.visual_steps && currentSegment.visual_steps.length > 0 && (
            <section aria-labelledby="visual-title" style={{marginTop: '32px'}}>
              <h3 id="visual-title" style={{fontSize: '1.125rem', marginBottom: '16px'}}>
                Visual Step-by-Step
              </h3>
              <div className="visual-steps">
                {currentSegment.visual_steps.map((step, i) => (
                  <div key={i} className="visual-step">
                    <span className="visual-step-number">{i + 1}</span>
                    <div className="visual-step-content">
                      <div className="visual-step-title">{step}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        ) : null}

        {concept && (
          <section aria-labelledby="objectives-title" style={{marginTop: '32px'}}>
            <h3 id="objectives-title" style={{fontSize: '1.125rem', marginBottom: '16px'}}>
              Learning Objectives
            </h3>
            <ul style={{paddingLeft: '24px'}}>
              {concept.learning_objectives.map((obj, i) => (
                <li key={i} style={{marginBottom: '8px'}}>{obj}</li>
              ))}
            </ul>
          </section>
        )}

        {concept && (
          <section aria-labelledby="keyfacts-title" style={{marginTop: '32px'}}>
            <h3 id="keyfacts-title" style={{fontSize: '1.125rem', marginBottom: '16px'}}>
              Key Facts
            </h3>
            <ul style={{paddingLeft: '24px'}}>
              {concept.key_facts.map((fact, i) => (
                <li key={i} style={{marginBottom: '8px'}}>{fact}</li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <div style={{display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: '32px'}}>
        <button
          className="btn btn-outline"
          onClick={handlePrevSegment}
          disabled={currentSegmentIndex === 0}
          aria-label="Previous section"
        >
          Previous Section
        </button>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <button className="btn btn-secondary" onClick={handlePractice} style={{minWidth: '180px'}}>
            Practice This Concept
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleNextSegment}
          disabled={isLastSegment}
          aria-label={nextAriaLabel}
        >
          {nextButtonLabel}
        </button>
      </div>

      <nav aria-label="Lesson sections" style={{marginTop: '32px'}}>
        <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center'}}>
          {adaptedSegments.map((seg, i) => {
            const segConcept = lesson.concepts.find(c => c.id === seg.concept_id)
            const segName = segConcept ? segConcept.name : seg.concept_id
            return (
              <button
                key={seg.id}
                className={i === currentSegmentIndex ? 'btn btn-primary' : 'btn btn-outline'}
                style={{minWidth: 'auto', padding: '4px 8px'}}
                onClick={() => { setCurrentSegmentIndex(i); stopAudio(); }}
                aria-current={i === currentSegmentIndex ? 'step' : undefined}
                aria-label={'Go to section ' + (i + 1) + ': ' + segName}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}