from fastapi import APIRouter
from models import RecommendRequest
from ai.agent import get_smart_recommendations, get_queue_status

router = APIRouter()


@router.post("/recommend")
async def recommend(request: RecommendRequest):
    """Get AI-powered food recommendations based on student preferences."""
    recommendations = await get_smart_recommendations(
        budget=request.budget,
        taste=request.taste,
        dietary=request.dietary,
        urgency=request.urgency
    )
    return {"recommendations": recommendations}


@router.get("/queue-status")
async def queue_status():
    """Get current queue status and wait time prediction."""
    status = get_queue_status()
    return status


@router.get("/smart-suggestions")
async def smart_suggestions():
    """Get proactive AI suggestions based on current queue and menu state."""
    queue = get_queue_status()
    suggestions = []

    if queue["estimated_wait_minutes"] > 15:
        suggestions.append({
            "type": "warning",
            "icon": "⏱️",
            "message": f"Queue is {queue['estimated_wait_minutes']} min long. Try quick items like Samosa or Poha — ready in under 4 min!"
        })

    if queue["estimated_wait_minutes"] < 5:
        suggestions.append({
            "type": "success",
            "icon": "🎉",
            "message": "Queue is almost empty! Great time to order anything from the menu."
        })

    # Time-based suggestions
    from datetime import datetime
    hour = datetime.now().hour
    if hour < 11:
        suggestions.append({
            "type": "info",
            "icon": "🌅",
            "message": "Good morning! Try our Masala Dosa (₹45) or Idli Sambar (₹30) for a fresh start."
        })
    elif 12 <= hour <= 14:
        suggestions.append({
            "type": "info",
            "icon": "☀️",
            "message": "Lunch rush! Chicken Biryani (₹120) is today's most popular pick."
        })
    elif hour >= 15:
        suggestions.append({
            "type": "info",
            "icon": "🌇",
            "message": "Evening snack time! Grab a Cold Coffee (₹50) with French Fries (₹40)."
        })

    return {"suggestions": suggestions}
