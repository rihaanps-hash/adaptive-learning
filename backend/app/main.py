from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import os
import random
import copy

app = FastAPI(title="Adaptive Learning API", version="1.0.0")

# In production set CORS_ORIGINS to a comma-separated list of allowed origins,
# e.g. "https://adaptive-learning.vercel.app". Vercel deployments (including
# preview URLs) are allowed automatically.
cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
cors_origins += ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://[a-zA-Z0-9-]+(-[a-zA-Z0-9-]+)*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FormatPreference(str, Enum):
    TEXT = "text"
    AUDIO = "audio"
    VISUAL = "visual"
    COMBINED = "combined"


class TextSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    EXTRA_LARGE = "extra_large"


class ContrastMode(str, Enum):
    NORMAL = "normal"
    HIGH = "high"
    DARK = "dark"


class ReadingComplexity(str, Enum):
    SIMPLE = "simple"
    STANDARD = "standard"
    ADVANCED = "advanced"


class Pacing(str, Enum):
    SLOWER = "slower"
    STANDARD = "standard"
    FASTER = "faster"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class LearnerPreferences(BaseModel):
    preferred_format: FormatPreference = FormatPreference.TEXT
    text_size: TextSize = TextSize.MEDIUM
    contrast_mode: ContrastMode = ContrastMode.NORMAL
    reading_complexity: ReadingComplexity = ReadingComplexity.STANDARD
    pacing: Pacing = Pacing.STANDARD


class LearnerProfile(BaseModel):
    id: str
    name: str
    preferences: LearnerPreferences
    concept_mastery: Dict[str, float] = Field(default_factory=dict)
    quiz_history: List[Dict[str, Any]] = Field(default_factory=list)


class LessonConcept(BaseModel):
    id: str
    name: str
    description: str
    key_facts: List[str]
    learning_objectives: List[str]


class LessonSegment(BaseModel):
    id: str
    concept_id: str
    original_content: str
    adapted_content: Optional[str] = None
    visual_steps: Optional[List[str]] = None
    audio_available: bool = False
    order: int
    difficulty: Difficulty = Difficulty.MEDIUM


class Lesson(BaseModel):
    id: str
    title: str
    description: str
    concepts: List[LessonConcept]
    segments: List[LessonSegment]


class QuizQuestion(BaseModel):
    id: str
    concept_id: str
    question: str
    options: List[str]
    correct_answer: int
    difficulty: Difficulty
    explanation: str


class QuizSubmission(BaseModel):
    learner_id: str
    answers: List[Dict[str, Any]]


class AdaptedLessonResponse(BaseModel):
    lesson: Lesson
    adapted_segments: List[LessonSegment]
    explanations: List[str]


# Bayesian Knowledge Tracing implementation
class BKTModel:
    def __init__(self):
        # P(L0) - initial probability of knowing the concept
        self.prior = 0.3
        # P(T) - probability of learning the concept after an opportunity
        self.learn_rate = 0.3
        # P(S) - probability of slipping (getting it wrong despite knowing)
        self.slip = 0.1
        # P(G) - probability of guessing (getting it right despite not knowing)
        self.guess = 0.2

    def update_mastery(self, current_mastery: float, is_correct: bool) -> float:
        """Update mastery probability based on correctness of answer."""
        if current_mastery == 0:
            current_mastery = self.prior

        if is_correct:
            # P(know | correct) = P(correct | know) * P(know) / P(correct)
            # P(correct | know) = 1 - slip
            # P(correct | not know) = guess
            p_correct_given_know = 1 - self.slip
            p_correct_given_not_know = self.guess
            p_know = current_mastery
            p_not_know = 1 - current_mastery
            p_correct = p_correct_given_know * p_know + p_correct_given_not_know * p_not_know
            new_mastery = (p_correct_given_know * p_know) / p_correct if p_correct > 0 else current_mastery
        else:
            # P(know | incorrect) = P(incorrect | know) * P(know) / P(incorrect)
            p_incorrect_given_know = self.slip
            p_incorrect_given_not_know = 1 - self.guess
            p_know = current_mastery
            p_not_know = 1 - current_mastery
            p_incorrect = p_incorrect_given_know * p_know + p_incorrect_given_not_know * p_not_know
            new_mastery = (p_incorrect_given_know * p_know) / p_incorrect if p_incorrect > 0 else current_mastery

        # Apply learning rate
        new_mastery = new_mastery + (1 - new_mastery) * self.learn_rate
        return min(max(new_mastery, 0.0), 1.0)


bkt_model = BKTModel()


# Sample lesson data
SAMPLE_LESSON = Lesson(
    id="lesson-1",
    title="Understanding Photosynthesis",
    description="Learn how plants convert light energy into chemical energy through photosynthesis.",
    concepts=[
        LessonConcept(
            id="concept-1",
            name="What is Photosynthesis",
            description="The basic definition and purpose of photosynthesis",
            key_facts=[
                "Photosynthesis is the process by which green plants make their own food",
                "It uses sunlight, carbon dioxide, and water",
                "The products are glucose (sugar) and oxygen"
            ],
            learning_objectives=[
                "Define photosynthesis in your own words",
                "Identify the three main inputs and two main outputs"
            ]
        ),
        LessonConcept(
            id="concept-2",
            name="The Photosynthesis Equation",
            description="The chemical equation representing photosynthesis",
            key_facts=[
                "6 CO2 + 6 H2O + light energy → C6H12O6 + 6 O2",
                "Carbon dioxide and water are reactants",
                "Glucose and oxygen are products",
                "Light energy is required (captured by chlorophyll)"
            ],
            learning_objectives=[
                "Write the balanced chemical equation",
                "Identify reactants and products",
                "Explain the role of chlorophyll"
            ]
        ),
        LessonConcept(
            id="concept-3",
            name="Stages of Photosynthesis",
            description="The two main stages: light-dependent and light-independent reactions",
            key_facts=[
                "Light-dependent reactions occur in thylakoid membranes",
                "Light-independent reactions (Calvin cycle) occur in stroma",
                "Light reactions produce ATP and NADPH",
                "Calvin cycle uses ATP and NADPH to make glucose"
            ],
            learning_objectives=[
                "Name the two stages and where they occur",
                "Describe what each stage produces",
                "Explain how the stages are connected"
            ]
        ),
    ],
    segments=[
        LessonSegment(
            id="seg-1",
            concept_id="concept-1",
            original_content="Photosynthesis is the amazing process where green plants create their own food using sunlight. Think of plants as tiny solar-powered factories! They take in carbon dioxide from the air through tiny pores in their leaves called stomata, and they absorb water through their roots. Using the energy from sunlight captured by chlorophyll (the green pigment in leaves), they transform these ingredients into glucose (a type of sugar) and release oxygen as a byproduct. This oxygen is what we breathe! Without photosynthesis, life on Earth as we know it would not exist.",
            visual_steps=[
                "Sunlight hits the leaf",
                "Chlorophyll captures light energy",
                "CO2 enters through stomata",
                "Water travels up from roots",
                "Energy transforms CO2 + H2O into glucose",
                "Oxygen is released"
            ],
            audio_available=True,
            order=1,
            difficulty=Difficulty.MEDIUM
        ),
        LessonSegment(
            id="seg-2",
            concept_id="concept-2",
            original_content="The photosynthesis equation shows exactly what goes in and what comes out. The balanced chemical equation is: 6 CO2 + 6 H2O + light energy → C6H12O6 + 6 O2. Let's break this down. On the left side (reactants), we have 6 molecules of carbon dioxide and 6 molecules of water, plus light energy. On the right side (products), we get 1 molecule of glucose (C6H12O6) and 6 molecules of oxygen. The light energy is captured by chlorophyll molecules in the chloroplasts. Think of it like a recipe: you need specific amounts of each ingredient to get the final product.",
            visual_steps=[
                "6 CO2 (carbon dioxide) + 6 H2O (water)",
                "Light energy captured by chlorophyll",
                "Chemical reaction occurs",
                "Produces: 1 C6H12O6 (glucose) + 6 O2 (oxygen)"
            ],
            audio_available=True,
            order=2,
            difficulty=Difficulty.MEDIUM
        ),
        LessonSegment(
            id="seg-3",
            concept_id="concept-3",
            original_content="Photosynthesis happens in two main stages, each in a different part of the chloroplast. The first stage is the light-dependent reactions, which happen in the thylakoid membranes (stacked like coins in structures called grana). These reactions need sunlight directly. They split water molecules, releasing oxygen, and create energy-carrying molecules called ATP and NADPH. The second stage is the light-independent reactions, also called the Calvin cycle, which happens in the stroma (the fluid-filled space around the thylakoids). This stage doesn't need direct light but uses the ATP and NADPH from the first stage to turn carbon dioxide into glucose through a cycle of chemical reactions.",
            visual_steps=[
                "Stage 1: Light-dependent reactions (in thylakoids)",
                "   - Sunlight splits water → O2 released",
                "   - Creates ATP and NADPH (energy carriers)",
                "Stage 2: Calvin cycle (in stroma)",
                "   - Uses ATP and NADPH",
                "   - Turns CO2 into glucose",
                "   - Cycle repeats to make more glucose"
            ],
            audio_available=True,
            order=3,
            difficulty=Difficulty.MEDIUM
        ),
    ]
)

QUIZ_QUESTIONS = [
    QuizQuestion(
        id="q1",
        concept_id="concept-1",
        question="What are the three main inputs needed for photosynthesis?",
        options=[
            "Sunlight, carbon dioxide, and water",
            "Oxygen, glucose, and sunlight",
            "Water, oxygen, and carbon dioxide",
            "Soil, sunlight, and air"
        ],
        correct_answer=0,
        difficulty=Difficulty.EASY,
        explanation="Photosynthesis requires sunlight (energy), carbon dioxide (from air), and water (from roots)."
    ),
    QuizQuestion(
        id="q2",
        concept_id="concept-1",
        question="What gas do plants release as a byproduct of photosynthesis?",
        options=["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correct_answer=1,
        difficulty=Difficulty.EASY,
        explanation="Plants release oxygen as a byproduct, which is essential for animal and human life."
    ),
    QuizQuestion(
        id="q3",
        concept_id="concept-2",
        question="In the photosynthesis equation 6 CO2 + 6 H2O + light energy → C6H12O6 + 6 O2, what is C6H12O6?",
        options=["Carbon dioxide", "Water", "Glucose", "Oxygen"],
        correct_answer=2,
        difficulty=Difficulty.MEDIUM,
        explanation="C6H12O6 is the chemical formula for glucose, the sugar produced during photosynthesis."
    ),
    QuizQuestion(
        id="q4",
        concept_id="concept-2",
        question="How many molecules of oxygen are produced for each molecule of glucose?",
        options=["1", "3", "6", "12"],
        correct_answer=2,
        difficulty=Difficulty.MEDIUM,
        explanation="The balanced equation shows 6 O2 molecules are produced per 1 C6H12O6 molecule."
    ),
    QuizQuestion(
        id="q5",
        concept_id="concept-3",
        question="Where do the light-dependent reactions of photosynthesis occur?",
        options=["In the stroma", "In the thylakoid membranes", "In the mitochondria", "In the nucleus"],
        correct_answer=1,
        difficulty=Difficulty.MEDIUM,
        explanation="Light-dependent reactions occur in the thylakoid membranes of chloroplasts."
    ),
    QuizQuestion(
        id="q6",
        concept_id="concept-3",
        question="What energy-carrying molecules are produced during light-dependent reactions and used in the Calvin cycle?",
        options=["ATP and NADPH", "Glucose and Oxygen", "CO2 and H2O", "Chlorophyll and Carotenoids"],
        correct_answer=0,
        difficulty=Difficulty.HARD,
        explanation="ATP and NADPH carry energy from light reactions to the Calvin cycle."
    ),
]

# Demo learner profiles
DEMO_LEARNERS = {
    "learner-1": LearnerProfile(
        id="learner-1",
        name="Alex (Visual Learner, Needs Simpler Language)",
        preferences=LearnerPreferences(
            preferred_format=FormatPreference.VISUAL,
            text_size=TextSize.LARGE,
            contrast_mode=ContrastMode.HIGH,
            reading_complexity=ReadingComplexity.SIMPLE,
            pacing=Pacing.SLOWER
        ),
        concept_mastery={
            "concept-1": 0.4,
            "concept-2": 0.2,
            "concept-3": 0.1
        },
        quiz_history=[
            {"question_id": "q1", "concept_id": "concept-1", "correct": True, "timestamp": "2024-01-15T10:00:00Z"},
            {"question_id": "q2", "concept_id": "concept-1", "correct": False, "timestamp": "2024-01-15T10:05:00Z"},
            {"question_id": "q3", "concept_id": "concept-2", "correct": False, "timestamp": "2024-01-15T10:10:00Z"},
        ]
    ),
    "learner-2": LearnerProfile(
        id="learner-2",
        name="Jordan (Audio Learner, Faster Pace)",
        preferences=LearnerPreferences(
            preferred_format=FormatPreference.AUDIO,
            text_size=TextSize.MEDIUM,
            contrast_mode=ContrastMode.NORMAL,
            reading_complexity=ReadingComplexity.ADVANCED,
            pacing=Pacing.FASTER
        ),
        concept_mastery={
            "concept-1": 0.8,
            "concept-2": 0.7,
            "concept-3": 0.6
        },
        quiz_history=[
            {"question_id": "q1", "concept_id": "concept-1", "correct": True, "timestamp": "2024-01-15T10:00:00Z"},
            {"question_id": "q2", "concept_id": "concept-1", "correct": True, "timestamp": "2024-01-15T10:05:00Z"},
            {"question_id": "q3", "concept_id": "concept-2", "correct": True, "timestamp": "2024-01-15T10:10:00Z"},
            {"question_id": "q4", "concept_id": "concept-2", "correct": True, "timestamp": "2024-01-15T10:15:00Z"},
            {"question_id": "q5", "concept_id": "concept-3", "correct": True, "timestamp": "2024-01-15T10:20:00Z"},
        ]
    )
}


def simplify_text(text: str, complexity: ReadingComplexity) -> str:
    """Simple text simplification based on reading complexity preference."""
    if complexity == ReadingComplexity.SIMPLE:
        # Basic simplification: shorter sentences, simpler words
        replacements = {
            "photosynthesis": "plant food-making",
            "chlorophyll": "green pigment",
            "carbon dioxide": "CO2 (air gas)",
            "glucose": "sugar",
            "thylakoid": "leaf membrane",
            "stroma": "leaf fluid",
            "Calvin cycle": "sugar-making cycle",
            "molecules": "tiny particles",
            "reactants": "starting materials",
            "products": "end results",
            "byproduct": "extra output",
            "captured": "caught",
            "transform": "change",
            "occur": "happen",
            "require": "need",
            "essential": "needed",
            "process": "steps",
            "equation": "formula",
            "balanced": "even",
            "membrane": "thin layer",
            "structure": "building",
            "fluid-filled": "liquid-filled",
            "cycle of chemical reactions": "repeating chemical steps",
            "energy-carrying": "energy-holding",
            "split": "break apart",
            "release": "let out",
            "create": "make",
            "transform": "change",
            "ingredients": "materials",
            "recipe": "formula",
            "specific amounts": "exact amounts",
            "final product": "end result",
            "stacked like coins": "stacked up",
            "directly": "right away",
            "through a cycle of": "by repeating",
        }
        simplified = text
        for complex_word, simple_word in replacements.items():
            simplified = simplified.replace(complex_word, simple_word)
            simplified = simplified.replace(complex_word.capitalize(), simple_word.capitalize())
        
        # Break long sentences
        sentences = simplified.split('. ')
        result = []
        for s in sentences:
            if len(s) > 100:
                parts = s.split(', ')
                result.extend(parts)
            else:
                result.append(s)
        return '. '.join(result) + '.'
    elif complexity == ReadingComplexity.ADVANCED:
        # Keep original but could add more detail
        return text
    return text


def adapt_segment(segment: LessonSegment, preferences: LearnerPreferences, mastery: float) -> LessonSegment:
    """Adapt a lesson segment based on learner preferences and mastery."""
    # Create a copy
    adapted = LessonSegment(
        id=segment.id,
        concept_id=segment.concept_id,
        original_content=segment.original_content,
        visual_steps=segment.visual_steps,
        audio_available=segment.audio_available,
        order=segment.order,
        difficulty=segment.difficulty
    )
    
    # Adapt text complexity
    adapted.adapted_content = simplify_text(segment.original_content, preferences.reading_complexity)
    
    # Adjust difficulty based on mastery
    if mastery < 0.3:
        adapted.difficulty = Difficulty.EASY
    elif mastery < 0.7:
        adapted.difficulty = Difficulty.MEDIUM
    else:
        adapted.difficulty = Difficulty.HARD
    
    return adapted


def get_adaptation_explanations(learner: LearnerProfile, segment: LessonSegment) -> List[str]:
    """Generate explanations for why content was adapted."""
    explanations = []
    prefs = learner.preferences
    mastery = learner.concept_mastery.get(segment.concept_id, 0.0)
    
    if prefs.reading_complexity == ReadingComplexity.SIMPLE:
        explanations.append("Text simplified to use easier words and shorter sentences based on your reading preference.")
    elif prefs.reading_complexity == ReadingComplexity.ADVANCED:
        explanations.append("Advanced vocabulary used based on your reading preference.")
    
    if prefs.preferred_format == FormatPreference.VISUAL and segment.visual_steps:
        explanations.append("Visual step-by-step breakdown provided based on your format preference.")
    
    if prefs.preferred_format == FormatPreference.AUDIO and segment.audio_available:
        explanations.append("Audio playback available based on your format preference.")
    
    if prefs.pacing == Pacing.SLOWER:
        explanations.append("Content paced slower with more detailed explanations per your preference.")
    elif prefs.pacing == Pacing.FASTER:
        explanations.append("Content condensed for faster pacing per your preference.")
    
    if mastery < 0.3:
        explanations.append(f"Difficulty set to easy (current mastery: {mastery:.0%}) to build confidence.")
    elif mastery > 0.7:
        explanations.append(f"Difficulty increased (current mastery: {mastery:.0%}) to provide challenge.")
    
    if prefs.text_size == TextSize.LARGE or prefs.text_size == TextSize.EXTRA_LARGE:
        explanations.append("Larger text size applied based on your preference.")
    
    if prefs.contrast_mode == ContrastMode.HIGH:
        explanations.append("High contrast mode enabled based on your preference.")
    
    return explanations


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/learners")
async def get_learners():
    return list(DEMO_LEARNERS.values())


@app.get("/api/learners/{learner_id}")
async def get_learner(learner_id: str):
    if learner_id not in DEMO_LEARNERS:
        raise HTTPException(status_code=404, detail="Learner not found")
    return DEMO_LEARNERS[learner_id]


@app.put("/api/learners/{learner_id}/preferences")
async def update_preferences(learner_id: str, preferences: LearnerPreferences):
    if learner_id not in DEMO_LEARNERS:
        raise HTTPException(status_code=404, detail="Learner not found")
    DEMO_LEARNERS[learner_id].preferences = preferences
    return DEMO_LEARNERS[learner_id]


@app.get("/api/lesson/{lesson_id}")
async def get_lesson(lesson_id: str):
    if lesson_id != SAMPLE_LESSON.id:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return SAMPLE_LESSON


@app.get("/api/lesson/{lesson_id}/adapted/{learner_id}")
async def get_adapted_lesson(lesson_id: str, learner_id: str):
    if lesson_id != SAMPLE_LESSON.id:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if learner_id not in DEMO_LEARNERS:
        raise HTTPException(status_code=404, detail="Learner not found")
    
    learner = DEMO_LEARNERS[learner_id]
    adapted_segments = []
    all_explanations = []
    
    for segment in SAMPLE_LESSON.segments:
        adapted = adapt_segment(segment, learner.preferences, learner.concept_mastery.get(segment.concept_id, 0.0))
        adapted_segments.append(adapted)
        explanations = get_adaptation_explanations(learner, segment)
        all_explanations.extend(explanations)
    
    # Remove duplicates while preserving order
    unique_explanations = list(dict.fromkeys(all_explanations))
    
    return AdaptedLessonResponse(
        lesson=SAMPLE_LESSON,
        adapted_segments=adapted_segments,
        explanations=unique_explanations
    )


@app.get("/api/quiz/{concept_id}")
async def get_quiz_questions(concept_id: str):
    questions = [q for q in QUIZ_QUESTIONS if q.concept_id == concept_id]
    if not questions:
        raise HTTPException(status_code=404, detail="No questions for this concept")
    return questions


@app.post("/api/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    if submission.learner_id not in DEMO_LEARNERS:
        raise HTTPException(status_code=404, detail="Learner not found")
    
    learner = DEMO_LEARNERS[submission.learner_id]
    results = []
    
    for answer in submission.answers:
        question_id = answer.get("question_id")
        selected = answer.get("selected_answer")
        
        question = next((q for q in QUIZ_QUESTIONS if q.id == question_id), None)
        if not question:
            continue
        
        is_correct = selected == question.correct_answer
        current_mastery = learner.concept_mastery.get(question.concept_id, 0.0)
        new_mastery = bkt_model.update_mastery(current_mastery, is_correct)
        learner.concept_mastery[question.concept_id] = new_mastery
        
        learner.quiz_history.append({
            "question_id": question_id,
            "concept_id": question.concept_id,
            "correct": is_correct,
            "previous_mastery": current_mastery,
            "new_mastery": new_mastery,
            "timestamp": "2024-01-15T10:00:00Z"
        })
        
        results.append({
            "question_id": question_id,
            "correct": is_correct,
            "explanation": question.explanation,
            "concept_id": question.concept_id,
            "mastery_before": current_mastery,
            "mastery_after": new_mastery
        })
    
    return {"results": results, "updated_mastery": learner.concept_mastery}


@app.get("/api/teacher/dashboard")
async def get_teacher_dashboard():
    dashboard_data = []
    for learner in DEMO_LEARNERS.values():
        recent_quizzes = learner.quiz_history[-5:] if learner.quiz_history else []
        mastery_summary = {k: f"{v:.0%}" for k, v in learner.concept_mastery.items()}
        
        # Suggest next steps based on lowest mastery
        next_concept = None
        if learner.concept_mastery:
            next_concept = min(learner.concept_mastery, key=learner.concept_mastery.get)
            next_concept_name = next((c.name for c in SAMPLE_LESSON.concepts if c.id == next_concept), next_concept)
        
        dashboard_data.append({
            "learner_id": learner.id,
            "name": learner.name,
            "preferences": learner.preferences.model_dump(),
            "concept_mastery": learner.concept_mastery,
            "mastery_summary": mastery_summary,
            "recent_quizzes": recent_quizzes,
            "total_quizzes": len(learner.quiz_history),
            "suggested_next_concept": next_concept,
            "suggested_next_concept_name": next_concept_name,
            "overall_progress": sum(learner.concept_mastery.values()) / len(learner.concept_mastery) if learner.concept_mastery else 0
        })
    
    return {"learners": dashboard_data}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))