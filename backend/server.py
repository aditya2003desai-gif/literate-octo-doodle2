from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import PyPDF2
import io
import re
import spacy
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Load spaCy model
nlp = spacy.load('en_core_web_sm')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StudentCreate(BaseModel):
    name: str
    email: str
    cgpa: float
    internships: int
    skills: Optional[str] = ""


class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    email: str
    cgpa: float
    internships: int
    skills: str
    resume_text: Optional[str] = ""
    extracted_skills: List[str] = []
    sentiment_score: float = 0.0
    sentiment_label: str = "Neutral"
    created_at: str


class CompanyCreate(BaseModel):
    name: str
    required_skills: str
    min_cgpa: float
    job_description: str


class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    required_skills: str
    min_cgpa: float
    job_description: str
    created_at: str


class MatchResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    student_id: str
    company_id: str
    student_name: str
    student_email: str
    cgpa: float
    internships: int
    extracted_skills: List[str]
    sentiment_score: float
    sentiment_label: str
    skill_similarity_score: float
    cgpa_score: float
    internship_score: float
    sentiment_weight: float
    final_score: float
    rank: int


# NLP Utility Functions
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        logging.error(f"PDF extraction error: {e}")
        return ""


def preprocess_text(text: str) -> str:
    """Preprocess text using spaCy - tokenization, lemmatization, stopword removal"""
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
    return " ".join(tokens)


def extract_skills(text: str) -> List[str]:
    """Extract technical skills from text using pattern matching"""
    # Common technical skills database
    skill_patterns = [
        r'\bpython\b', r'\bjava\b', r'\bjavascript\b', r'\bc\+\+\b', r'\bc#\b',
        r'\breact\b', r'\bangular\b', r'\bvue\b', r'\bnode\.?js\b', r'\bexpress\b',
        r'\bdjango\b', r'\bflask\b', r'\bspring\b', r'\b\.net\b',
        r'\bsql\b', r'\bmysql\b', r'\bpostgresql\b', r'\bmongodb\b', r'\boracle\b',
        r'\bmachine learning\b', r'\bdeep learning\b', r'\bai\b', r'\bnlp\b',
        r'\bdata science\b', r'\bdata analysis\b', r'\bpandas\b', r'\bnumpy\b',
        r'\btensorflow\b', r'\bpytorch\b', r'\bkeras\b', r'\bscikit-learn\b',
        r'\baws\b', r'\bazure\b', r'\bgcp\b', r'\bdocker\b', r'\bkubernetes\b',
        r'\bgit\b', r'\bjenkins\b', r'\bci/cd\b', r'\bdevops\b',
        r'\bhtml\b', r'\bcss\b', r'\btailwind\b', r'\bbootstrap\b',
        r'\brest api\b', r'\bgraphql\b', r'\bmicroservices\b',
        r'\blinux\b', r'\bunix\b', r'\bshell scripting\b',
        r'\bui/ux\b', r'\bfigma\b', r'\badobe xd\b',
        r'\bagile\b', r'\bscrum\b', r'\bjira\b'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for pattern in skill_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            skill_name = matches[0].strip().title()
            if skill_name not in found_skills:
                found_skills.append(skill_name)
    
    return found_skills


def analyze_sentiment(text: str) -> tuple:
    """Analyze sentiment using TextBlob"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
    
    return polarity, label


def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """Calculate cosine similarity between two texts using TF-IDF"""
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except:
        return 0.0


def calculate_final_score(skill_sim: float, cgpa: float, internships: int, sentiment: float) -> float:
    """Calculate weighted final score"""
    # Normalize scores
    cgpa_normalized = min(cgpa / 10.0, 1.0)
    internship_normalized = min(internships / 5.0, 1.0)
    sentiment_normalized = (sentiment + 1) / 2
    
    # Weighted formula
    final_score = (
        0.4 * skill_sim +
        0.25 * cgpa_normalized +
        0.2 * internship_normalized +
        0.15 * sentiment_normalized
    )
    
    return round(final_score * 100, 2)


# API Routes
@api_router.get("/")
async def root():
    return {"message": "PlacementAI API is running"}


@api_router.post("/students")
async def create_student(student: StudentCreate):
    """Create a new student without resume"""
    student_id = str(uuid.uuid4())
    
    student_doc = {
        "id": student_id,
        "name": student.name,
        "email": student.email,
        "cgpa": student.cgpa,
        "internships": student.internships,
        "skills": student.skills,
        "resume_text": "",
        "extracted_skills": [],
        "sentiment_score": 0.0,
        "sentiment_label": "Neutral",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.students.insert_one(student_doc)
    return {"message": "Student created successfully", "id": student_id}


@api_router.post("/students/{student_id}/upload-resume")
async def upload_resume(student_id: str, file: UploadFile = File(...)):
    """Upload and process resume for a student"""
    try:
        # Read file
        contents = await file.read()
        
        # Extract text
        if file.filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(contents)
        else:
            resume_text = contents.decode('utf-8', errors='ignore')
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from resume")
        
        # Preprocess text
        processed_text = preprocess_text(resume_text)
        
        # Extract skills
        extracted_skills = extract_skills(resume_text)
        
        # Sentiment analysis
        sentiment_score, sentiment_label = analyze_sentiment(resume_text)
        
        # Update student
        await db.students.update_one(
            {"id": student_id},
            {"$set": {
                "resume_text": resume_text,
                "extracted_skills": extracted_skills,
                "sentiment_score": sentiment_score,
                "sentiment_label": sentiment_label
            }}
        )
        
        return {
            "message": "Resume processed successfully",
            "extracted_skills": extracted_skills,
            "sentiment_score": sentiment_score,
            "sentiment_label": sentiment_label
        }
    
    except Exception as e:
        logging.error(f"Resume upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/students", response_model=List[Student])
async def get_students():
    """Get all students"""
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    return students


@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    """Get a specific student"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@api_router.post("/companies")
async def create_company(company: CompanyCreate):
    """Create a new company"""
    company_id = str(uuid.uuid4())
    
    company_doc = {
        "id": company_id,
        "name": company.name,
        "required_skills": company.required_skills,
        "min_cgpa": company.min_cgpa,
        "job_description": company.job_description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.companies.insert_one(company_doc)
    return {"message": "Company created successfully", "id": company_id}


@api_router.get("/companies", response_model=List[Company])
async def get_companies():
    """Get all companies"""
    companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    return companies


@api_router.get("/companies/{company_id}", response_model=Company)
async def get_company(company_id: str):
    """Get a specific company"""
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@api_router.post("/match/{company_id}")
async def match_students(company_id: str):
    """Match students with a company and rank them"""
    # Get company
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get all students with resume
    students = await db.students.find({"resume_text": {"$ne": ""}}, {"_id": 0}).to_list(1000)
    
    if not students:
        raise HTTPException(status_code=404, detail="No students with resumes found")
    
    matches = []
    company_text = f"{company['required_skills']} {company['job_description']}"
    company_processed = preprocess_text(company_text)
    
    for student in students:
        # Skip if CGPA is below minimum
        if student['cgpa'] < company['min_cgpa']:
            continue
        
        # Calculate skill similarity
        student_text = f"{student.get('resume_text', '')} {student.get('skills', '')}"
        student_processed = preprocess_text(student_text)
        
        skill_similarity = calculate_cosine_similarity(student_processed, company_processed)
        
        # Calculate final score
        final_score = calculate_final_score(
            skill_similarity,
            student['cgpa'],
            student['internships'],
            student.get('sentiment_score', 0.0)
        )
        
        match = {
            "id": str(uuid.uuid4()),
            "student_id": student['id'],
            "company_id": company_id,
            "student_name": student['name'],
            "student_email": student['email'],
            "cgpa": student['cgpa'],
            "internships": student['internships'],
            "extracted_skills": student.get('extracted_skills', []),
            "sentiment_score": student.get('sentiment_score', 0.0),
            "sentiment_label": student.get('sentiment_label', 'Neutral'),
            "skill_similarity_score": round(skill_similarity * 100, 2),
            "cgpa_score": round(min(student['cgpa'] / 10.0, 1.0) * 100, 2),
            "internship_score": round(min(student['internships'] / 5.0, 1.0) * 100, 2),
            "sentiment_weight": round(((student.get('sentiment_score', 0.0) + 1) / 2) * 100, 2),
            "final_score": final_score,
            "rank": 0
        }
        matches.append(match)
    
    # Sort by final score (descending) - Merge Sort is used internally by Python
    matches.sort(key=lambda x: x['final_score'], reverse=True)
    
    # Assign ranks
    for idx, match in enumerate(matches):
        match['rank'] = idx + 1
    
    # Delete existing matches for this company
    await db.matches.delete_many({"company_id": company_id})
    
    # Insert new matches
    if matches:
        await db.matches.insert_many(matches)
    
    return {
        "message": "Matching completed successfully",
        "total_matches": len(matches)
    }


@api_router.get("/rankings/{company_id}", response_model=List[MatchResult])
async def get_rankings(company_id: str):
    """Get ranked students for a company"""
    matches = await db.matches.find(
        {"company_id": company_id},
        {"_id": 0}
    ).sort("rank", 1).to_list(1000)
    
    if not matches:
        raise HTTPException(status_code=404, detail="No matches found. Please run matching first.")
    
    return matches


@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_students = await db.students.count_documents({})
    total_companies = await db.companies.count_documents({})
    students_with_resume = await db.students.count_documents({"resume_text": {"$ne": ""}})
    
    # Get sentiment distribution
    students = await db.students.find({"resume_text": {"$ne": ""}}, {"_id": 0, "sentiment_label": 1}).to_list(1000)
    sentiment_dist = {"Positive": 0, "Neutral": 0, "Negative": 0}
    for s in students:
        label = s.get('sentiment_label', 'Neutral')
        sentiment_dist[label] += 1
    
    # Get skill distribution (top 10)
    all_students = await db.students.find({"extracted_skills": {"$ne": []}}, {"_id": 0, "extracted_skills": 1}).to_list(1000)
    skill_count = {}
    for s in all_students:
        for skill in s.get('extracted_skills', []):
            skill_count[skill] = skill_count.get(skill, 0) + 1
    
    top_skills = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "students_with_resume": students_with_resume,
        "sentiment_distribution": sentiment_dist,
        "top_skills": dict(top_skills)
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
