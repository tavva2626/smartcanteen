import json
import os
from datetime import datetime
from fastapi import APIRouter
from models import PlaceOrderRequest
from ai.agent import order_queue, get_menu_data

router = APIRouter()

# Order ID counter
_order_counter = 100


def _get_next_order_id():
    global _order_counter
    _order_counter += 1
    return f"ORD-{_order_counter}"


@router.get("/orders")
async def get_orders():
    """Get all orders (starts empty, populated when students place orders)."""
    return {"orders": order_queue}


@router.post("/orders")
async def place_order(request: PlaceOrderRequest):
    """Place a new order."""
    order_id = _get_next_order_id()
    now = datetime.now().strftime("%I:%M %p")

    menu_data = get_menu_data()
    items_map = {item["id"]: item for item in menu_data["menu_items"]}

    total_prep = 0
    for item in request.items:
        menu_item = items_map.get(item.item_id)
        if menu_item:
            total_prep += menu_item["prepTime"] * item.quantity

    order = {
        "id": order_id,
        "student_name": request.student_name,
        "items": [item.dict() for item in request.items],
        "total": sum(item.price * item.quantity for item in request.items),
        "status": "placed",
        "placed_at": now,
        "estimated_ready": f"~{total_prep} min"
    }

    order_queue.append(order)
    print(f"📦 NEW ORDER RECEIVED: {order_id} from {request.student_name}")
    print(f"   Items: {[i.item_name for i in request.items]}")
    return {"order": order, "message": f"Order {order_id} placed successfully!"}


@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    """Update order status (placed → preparing → ready → completed)."""
    for order in order_queue:
        if order["id"] == order_id:
            order["status"] = status
            return {"order": order, "message": f"Order {order_id} updated to {status}"}
    return {"error": "Order not found"}


@router.put("/inventory/{item_id}/availability")
async def update_item_availability(item_id: int, is_available: bool):
    """Toggle item availability (Manager access)."""
    from ai.agent import menu_items
    for item in menu_items:
        if item["id"] == item_id:
            item["isAvailable"] = is_available
            return {"message": f"Item {item['name']} availability set to {is_available}", "item": item}
    return {"error": "Item not found"}


@router.get("/menu")
async def get_menu():
    """Get the full menu."""
    menu_data = get_menu_data()
    return {"menu": menu_data["menu_items"]}


@router.get("/inventory")
async def get_inventory():
    """Get inventory status for all menu items."""
    menu_data = get_menu_data()
    inventory = []
    for item in menu_data["menu_items"]:
        inventory.append({
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "stock": item["stock"],
            "isAvailable": item["isAvailable"],
            "price": item["price"],
            "emoji": item.get("emoji", "🍔")
        })
    return {"inventory": inventory}
