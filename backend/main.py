import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, recommend, orders, tables

app = FastAPI(
    title="Smart Canteen AI Backend",
    description="AI-powered canteen pre-order system with RAG + LangChain + Groq",
    version="1.0.0"
)

# CORS — Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:9999", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(recommend.router, prefix="/api", tags=["Recommendations"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(tables.router, prefix="/api", tags=["Tables"])


@app.get("/")
async def root():
    return {
        "message": "🍽️ Smart Canteen AI Backend is running!",
        "docs": "/docs",
        "endpoints": {
            "chat": "POST /api/chat",
            "recommend": "POST /api/recommend",
            "queue_status": "GET /api/queue-status",
            "menu": "GET /api/menu",
            "orders": "GET /api/orders",
            "tables": "GET /api/tables",
            "book_table": "POST /api/tables/book",
            "suggest_table": "GET /api/tables/suggest?members=4"
        }
    }


@app.on_event("startup")
async def startup():
    """Initialize RAG vector store on startup."""
    print("🚀 Starting Smart Canteen AI Backend...")
    print("📚 Initializing RAG knowledge base...")
    try:
        from ai.rag import get_retriever
        get_retriever()
        print("✅ RAG knowledge base ready!")
    except Exception as e:
        print(f"⚠️ RAG init warning (will initialize on first chat): {e}")
    print("🍽️ Smart Canteen AI Backend is ready!")
