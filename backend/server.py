from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 1 week

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class Tenant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TenantCreate(BaseModel):
    name: str
    email: str
    password: str

class TenantLogin(BaseModel):
    email: str
    password: str

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    domain: str
    tracking_code: str = Field(default_factory=lambda: str(uuid.uuid4()))
    privacy_settings: Dict[str, Any] = Field(default_factory=lambda: {
        "anonymize_ip": True,
        "require_consent": True,
        "respect_dnt": True
    })
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    name: str
    domain: str

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    session_id: str
    event_type: str  # pageview, click, custom
    event_name: Optional[str] = None
    page_url: Optional[str] = None
    page_title: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    ip_hash: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    project_id: str
    tracking_code: str
    session_id: str
    event_type: str
    event_name: Optional[str] = None
    page_url: Optional[str] = None
    page_title: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None
    consent_given: bool = False

class NLQRequest(BaseModel):
    project_id: str
    question: str
    date_range: Optional[str] = "7d"  # 7d, 30d, 90d, all

class NLQResponse(BaseModel):
    question: str
    answer: str
    data: Optional[Dict[str, Any]] = None
    insights: List[str] = Field(default_factory=list)

# ==================== AUTH UTILITIES ====================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def create_token(tenant_id: str, email: str) -> str:
    payload = {
        'tenant_id': tenant_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid authorization header')
    
    token = authorization.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(input: TenantCreate):
    # Check if email exists
    existing = await db.tenants.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant = Tenant(
        name=input.name,
        email=input.email,
        password_hash=hash_password(input.password)
    )
    
    doc = tenant.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tenants.insert_one(doc)
    
    token = create_token(tenant.id, tenant.email)
    return {"token": token, "tenant": {"id": tenant.id, "name": tenant.name, "email": tenant.email}}

@api_router.post("/auth/login")
async def login(input: TenantLogin):
    tenant_doc = await db.tenants.find_one({"email": input.email}, {"_id": 0})
    if not tenant_doc or not verify_password(input.password, tenant_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(tenant_doc['id'], tenant_doc['email'])
    return {"token": token, "tenant": {"id": tenant_doc['id'], "name": tenant_doc['name'], "email": tenant_doc['email']}}

# ==================== PROJECT ROUTES ====================

@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate, user: dict = Depends(verify_token)):
    project = Project(
        tenant_id=user['tenant_id'],
        name=input.name,
        domain=input.domain
    )
    
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.projects.insert_one(doc)
    
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects(user: dict = Depends(verify_token)):
    projects = await db.projects.find({"tenant_id": user['tenant_id']}, {"_id": 0}).to_list(100)
    for p in projects:
        if isinstance(p['created_at'], str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, user: dict = Depends(verify_token)):
    project = await db.projects.find_one({"id": project_id, "tenant_id": user['tenant_id']}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    return project

# ==================== TRACKING ROUTES ====================

@api_router.post("/track")
async def track_event(event_input: EventCreate):
    # Verify tracking code
    project = await db.projects.find_one(
        {"id": event_input.project_id, "tracking_code": event_input.tracking_code},
        {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=403, detail="Invalid project or tracking code")
    
    # Privacy checks
    privacy_settings = project.get('privacy_settings', {})
    if privacy_settings.get('require_consent', True) and not event_input.consent_given:
        return {"status": "consent_required"}
    
    # Anonymize IP if enabled
    ip_hash = None
    if event_input.ip_address and privacy_settings.get('anonymize_ip', True):
        ip_hash = hashlib.sha256(event_input.ip_address.encode()).hexdigest()[:16]
    
    event = Event(
        project_id=event_input.project_id,
        session_id=event_input.session_id,
        event_type=event_input.event_type,
        event_name=event_input.event_name,
        page_url=event_input.page_url,
        page_title=event_input.page_title,
        referrer=event_input.referrer,
        user_agent=event_input.user_agent,
        ip_hash=ip_hash,
        properties=event_input.properties
    )
    
    doc = event.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.events.insert_one(doc)
    
    return {"status": "tracked", "event_id": event.id}

# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/{project_id}/overview")
async def get_analytics_overview(project_id: str, days: int = 7, user: dict = Depends(verify_token)):
    # Verify project ownership
    project = await db.projects.find_one({"id": project_id, "tenant_id": user['tenant_id']}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_date_iso = start_date.isoformat()
    
    # Get events in date range
    events = await db.events.find({
        "project_id": project_id,
        "timestamp": {"$gte": start_date_iso}
    }, {"_id": 0}).to_list(10000)
    
    # Calculate metrics
    total_pageviews = sum(1 for e in events if e['event_type'] == 'pageview')
    unique_sessions = len(set(e['session_id'] for e in events))
    total_events = len(events)
    
    # Top pages
    page_counts = {}
    for e in events:
        if e['event_type'] == 'pageview' and e.get('page_url'):
            page_counts[e['page_url']] = page_counts.get(e['page_url'], 0) + 1
    top_pages = sorted(page_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Traffic over time (daily)
    daily_traffic = {}
    for e in events:
        date_str = e['timestamp'][:10]  # YYYY-MM-DD
        daily_traffic[date_str] = daily_traffic.get(date_str, 0) + 1
    
    return {
        "total_pageviews": total_pageviews,
        "unique_sessions": unique_sessions,
        "total_events": total_events,
        "top_pages": [{"url": url, "views": count} for url, count in top_pages],
        "daily_traffic": [{"date": date, "count": count} for date, count in sorted(daily_traffic.items())]
    }

# ==================== NLQ ROUTES ====================

@api_router.post("/nlq", response_model=NLQResponse)
async def process_nlq(request: NLQRequest, user: dict = Depends(verify_token)):
    # Verify project ownership
    project = await db.projects.find_one({"id": request.project_id, "tenant_id": user['tenant_id']}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get date range
    days_map = {"7d": 7, "30d": 30, "90d": 90, "all": 365}
    days = days_map.get(request.date_range, 7)
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_date_iso = start_date.isoformat()
    
    # Fetch analytics data
    events = await db.events.find({
        "project_id": request.project_id,
        "timestamp": {"$gte": start_date_iso}
    }, {"_id": 0}).to_list(10000)
    
    # Prepare data summary for LLM
    total_pageviews = sum(1 for e in events if e['event_type'] == 'pageview')
    unique_sessions = len(set(e['session_id'] for e in events))
    
    page_counts = {}
    for e in events:
        if e['event_type'] == 'pageview' and e.get('page_url'):
            page_counts[e['page_url']] = page_counts.get(e['page_url'], 0) + 1
    top_pages = sorted(page_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Daily traffic
    daily_traffic = {}
    for e in events:
        date_str = e['timestamp'][:10]
        daily_traffic[date_str] = daily_traffic.get(date_str, 0) + 1
    
    data_summary = {
        "period": f"last {days} days",
        "total_pageviews": total_pageviews,
        "unique_sessions": unique_sessions,
        "top_pages": top_pages,
        "daily_traffic": daily_traffic
    }
    
    # Use GPT-5 to generate insights
    system_message = f"""You are an analytics assistant. Analyze website analytics data and answer user questions with clear, actionable insights.
    
Data available:
{json.dumps(data_summary, indent=2)}

Provide concise, data-driven answers. Include specific numbers and trends."""
    
    chat = LlmChat(
        api_key=os.environ.get('EMERGENT_LLM_KEY'),
        session_id=f"nlq-{request.project_id}",
        system_message=system_message
    ).with_model("openai", "gpt-5")
    
    user_message = UserMessage(text=request.question)
    response_text = await chat.send_message(user_message)
    
    # Extract insights
    insights = []
    if total_pageviews > 0:
        avg_per_session = total_pageviews / unique_sessions if unique_sessions > 0 else 0
        insights.append(f"Average {avg_per_session:.1f} pageviews per session")
    
    return NLQResponse(
        question=request.question,
        answer=response_text,
        data=data_summary,
        insights=insights
    )

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Analytics Platform API", "version": "1.0.0"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
