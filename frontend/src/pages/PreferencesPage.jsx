import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLearnerContext } from '../context/LearnerContext'

const FORMAT_OPTIONS = [
  { value: 'text', label: 'Text', description: 'Standard text-based content' },
  { value: 'audio', label: 'Audio', description: 'Text-to-speech playback available' },
  { value: 'visual', label: 'Visual Steps', description: 'Step-by-step visual breakdowns' },
  { value: 'combined', label: 'Combined', description: 'Text, audio, and visual together' },
]

const TEXT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'extra_large', label: 'Extra Large' },
]

const CONTRAST_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High Contrast' },
  { value: 'dark', label: 'Dark Mode' },
]

const COMPLEXITY_OPTIONS = [
  { value: 'simple', label: 'Simple', description: 'Simplified language, shorter sentences' },
  { value: 'standard', label: 'Standard', description: 'Balanced vocabulary and sentence length' },
  { value: 'advanced', label: 'Advanced', description: 'Rich vocabulary, detailed explanations' },
]

const PACING_OPTIONS = [
  { value: 'slower', label: 'Slower', description: 'More detail, smaller chunks, slower pace' },
  { value: 'standard', label: 'Standard', description: 'Balanced pacing' },
  { value: 'faster', label: 'Faster', description: 'Condensed content, quicker pace' },
]

export default function PreferencesPage() {
  const { learnerId } = useParams()
  const { currentLearner, updateLearner } = useLearnerContext()
  const navigate = useNavigate()

  const learner = currentLearner?.id === learnerId ? currentLearner : null

  if (!learner) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Learner profile not found.</p>
      </div>
    )
  }

  const [preferences, setPreferences] = useState(learner.preferences)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (learner) {
      setPreferences(learner.preferences)
    }
  }, [learner])

  const applyTheme = (prefs) => {
    const html = document.documentElement
    html.dataset.textSize = prefs.text_size
    html.dataset.theme = prefs.contrast_mode === 'high' ? 'high-contrast' : 
                         prefs.contrast_mode === 'dark' ? 'dark' : ''
  }

  useEffect(() => {
    applyTheme(preferences)
  }, [preferences])

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/learners/${learnerId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      if (!response.ok) throw new Error('Failed to save preferences')
      const updated = await response.json()
      updateLearner(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Error saving preferences: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const RadioGroup = ({ name, label, description, options, value, onChange }) => (
    <fieldset className="form-group">
      <legend className="form-label">{label}</legend>
      {description && <p className="form-hint">{description}</p>}
      <div className="radio-group" role="radiogroup" aria-label={label}>
        {options.map(opt => (
          <label key={opt.value} className="radio-option">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              aria-describedby={`${name}-${opt.value}-desc`}
            />
            <div>
              <span className="radio-option-label">{opt.label}</span>
              {opt.description && (
                <span id={`${name}-${opt.value}-desc`} className="radio-option-description">
                  {opt.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  )

  return (
    <div>
      <section aria-labelledby="prefs-title">
        <h1 id="prefs-title" className="page-title">Learning Preferences</h1>
        <p className="page-subtitle">
          Customize how lessons are presented to you. Changes apply immediately and are saved to your profile.
        </p>
      </section>

      {saved && (
        <div className="alert alert-success" role="status" aria-live="polite">
          Preferences saved successfully!
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <RadioGroup
          name="preferred_format"
          label="Preferred Content Format"
          description="How would you like lesson content delivered?"
          options={FORMAT_OPTIONS}
          value={preferences.preferred_format}
          onChange={v => handleChange('preferred_format', v)}
        />

        <RadioGroup
          name="text_size"
          label="Text Size"
          description="Adjust the base font size for all content"
          options={TEXT_SIZE_OPTIONS}
          value={preferences.text_size}
          onChange={v => handleChange('text_size', v)}
        />

        <RadioGroup
          name="contrast_mode"
          label="Contrast Mode"
          description="Choose a color scheme for better readability"
          options={CONTRAST_OPTIONS}
          value={preferences.contrast_mode}
          onChange={v => handleChange('contrast_mode', v)}
        />

        <RadioGroup
          name="reading_complexity"
          label="Reading Complexity"
          description="Set the vocabulary level and sentence complexity"
          options={COMPLEXITY_OPTIONS}
          value={preferences.reading_complexity}
          onChange={v => handleChange('reading_complexity', v)}
        />

        <RadioGroup
          name="pacing"
          label="Content Pacing"
          description="Control how quickly new information is presented"
          options={PACING_OPTIONS}
          value={preferences.pacing}
          onChange={v => handleChange('pacing', v)}
        />

        <div style={{display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-xl)'}}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/learner/${learnerId}`)}>
            Cancel
          </button>
        </div>
      </form>

      <section aria-labelledby="preview-title" className="section">
        <h2 id="preview-title" className="section-title">Live Preview</h2>
        <p className="section-subtitle">See how your preferences affect content presentation:</p>
        <div className="card" style={{padding: 'var(--spacing-xl)'}}>
          <h3 style={{fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-md)'}}>
            Sample Lesson Text
          </h3>
          <p style={{lineHeight: 1.8}}>
            Photosynthesis is the process where green plants create their own food using sunlight. 
            They take in carbon dioxide from the air and water from their roots. Using energy from 
            sunlight captured by chlorophyll, they transform these into glucose and release oxygen.
          </p>
          <div className="visual-steps" style={{marginTop: 'var(--spacing-lg)'}}>
            <div className="visual-step">
              <span className="visual-step-number">1</span>
              <div className="visual-step-content">
                <div className="visual-step-title">Sunlight hits the leaf</div>
                <div className="visual-step-description">Chlorophyll captures light energy</div>
              </div>
            </div>
            <div className="visual-step">
              <span className="visual-step-number">2</span>
              <div className="visual-step-content">
                <div className="visual-step-title">CO2 enters through stomata</div>
                <div className="visual-step-description">Water travels up from roots</div>
              </div>
            </div>
          </div>
          <div className="audio-player" style={{marginTop: 'var(--spacing-lg)'}}>
            <button className="audio-player-btn" aria-label="Play audio" disabled>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div className="audio-player-progress" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Audio playback progress">
              <div className="audio-player-progress-fill" style={{width: '0%'}}></div>
            </div>
            <span style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>0:00 / 0:30</span>
          </div>
        </div>
      </section>
    </div>
  )
}