from datetime import datetime
from fastapi import APIRouter
from models import TableBookingRequest

router = APIRouter()

# In-memory table data
canteen_tables = [
    {"id": 1, "label": "T1", "x": 8, "y": 18, "capacity": 2, "shape": "round", "status": "available", "zone": "window"},
    {"id": 2, "label": "T2", "x": 28, "y": 18, "capacity": 2, "shape": "round", "status": "occupied", "zone": "window"},
    {"id": 3, "label": "T3", "x": 48, "y": 18, "capacity": 4, "shape": "square", "status": "available", "zone": "window"},
    {"id": 4, "label": "T4", "x": 68, "y": 18, "capacity": 4, "shape": "square", "status": "reserved", "zone": "window"},
    {"id": 5, "label": "T5", "x": 88, "y": 18, "capacity": 2, "shape": "round", "status": "available", "zone": "window"},
    {"id": 6, "label": "T6", "x": 8, "y": 40, "capacity": 4, "shape": "square", "status": "available", "zone": "center"},
    {"id": 7, "label": "T7", "x": 28, "y": 40, "capacity": 6, "shape": "long", "status": "occupied", "zone": "center"},
    {"id": 8, "label": "T8", "x": 53, "y": 40, "capacity": 8, "shape": "long", "status": "available", "zone": "center"},
    {"id": 9, "label": "T9", "x": 78, "y": 40, "capacity": 4, "shape": "square", "status": "available", "zone": "center"},
    {"id": 10, "label": "T10", "x": 8, "y": 62, "capacity": 2, "shape": "round", "status": "available", "zone": "counter"},
    {"id": 11, "label": "T11", "x": 28, "y": 62, "capacity": 4, "shape": "square", "status": "occupied", "zone": "counter"},
    {"id": 12, "label": "T12", "x": 48, "y": 62, "capacity": 6, "shape": "long", "status": "available", "zone": "counter"},
    {"id": 13, "label": "T13", "x": 68, "y": 62, "capacity": 2, "shape": "round", "status": "maintenance", "zone": "counter"},
    {"id": 14, "label": "T14", "x": 88, "y": 62, "capacity": 4, "shape": "square", "status": "available", "zone": "counter"},
    {"id": 15, "label": "T15", "x": 18, "y": 82, "capacity": 8, "shape": "long", "status": "available", "zone": "entrance"},
    {"id": 16, "label": "T16", "x": 48, "y": 82, "capacity": 4, "shape": "square", "status": "reserved", "zone": "entrance"},
    {"id": 17, "label": "T17", "x": 78, "y": 82, "capacity": 6, "shape": "long", "status": "available", "zone": "entrance"},
    {"id": 18, "label": "T18", "x": 48, "y": 40, "capacity": 2, "shape": "round", "status": "available", "zone": "center"}
]

# In-memory bookings (starts empty — populated when students book)
table_bookings = []

_booking_counter = 0


@router.get("/tables")
async def get_tables():
    """Get all canteen tables with their current status."""
    return {"tables": canteen_tables}


@router.get("/tables/available")
async def get_available_tables(time_slot: str = None, members: int = 1):
    """Get available tables filtered by time slot and member count."""
    available = [
        t for t in canteen_tables
        if t["status"] == "available" and t["capacity"] >= members
    ]
    return {"tables": available, "count": len(available)}


@router.post("/tables/book")
async def book_table(request: TableBookingRequest):
    """Book a table."""
    global _booking_counter

    # Find the table
    table = next((t for t in canteen_tables if t["id"] == request.table_id), None)
    if not table:
        return {"error": "Table not found"}

    if table["status"] != "available":
        return {"error": "Table is not available"}

    if request.members > table["capacity"]:
        return {"error": f"Table capacity is {table['capacity']} but you selected {request.members} members"}

    # Create booking
    _booking_counter += 1
    booking_id = f"BK-{_booking_counter:03d}"

    booking = {
        "id": booking_id,
        "student_name": request.student_name,
        "table_id": request.table_id,
        "date": request.date,
        "time_slot": request.time_slot,
        "members": request.members,
        "status": "confirmed"
    }

    table_bookings.append(booking)
    table["status"] = "reserved"

    return {
        "booking": booking,
        "message": f"🎉 Table {table['label']} booked successfully for {request.time_slot}!"
    }


@router.delete("/tables/bookings/{booking_id}")
async def cancel_booking(booking_id: str):
    """Cancel a table booking."""
    booking = next((b for b in table_bookings if b["id"] == booking_id), None)
    if not booking:
        return {"error": "Booking not found"}

    # Free up the table
    table = next((t for t in canteen_tables if t["id"] == booking["table_id"]), None)
    if table:
        table["status"] = "available"

    booking["status"] = "cancelled"

    return {"message": f"Booking {booking_id} cancelled successfully", "booking": booking}


@router.get("/tables/bookings")
async def get_bookings():
    """Get all active bookings."""
    active = [b for b in table_bookings if b["status"] == "confirmed"]
    return {"bookings": active}


@router.get("/tables/bookings/all")
async def get_all_bookings():
    """Get all bookings including cancelled ones for manager history."""
    return {"bookings": table_bookings}


@router.put("/tables/{table_id}/status")
async def update_table_status(table_id: int, status: str):
    """Update table status manually (Manager access)."""
    table = next((t for t in canteen_tables if t["id"] == table_id), None)
    if not table:
        return {"error": "Table not found"}
    
    valid_statuses = ["available", "occupied", "reserved", "maintenance"]
    if status not in valid_statuses:
        return {"error": f"Invalid status. Must be one of {valid_statuses}"}
    
    table["status"] = status
    return {"message": f"Table {table['label']} updated to {status}", "table": table}


@router.get("/tables/suggest")
async def suggest_table(members: int = 1):
    """AI-powered table suggestion based on group size."""
    # Only suggest AVAILABLE tables
    available = [
        t for t in canteen_tables
        if t["status"] == "available" and t["capacity"] >= members
    ]

    if not available:
        return {
            "suggestion": None,
            "message": f"😔 No tables currently available for {members} people. Please check back later!"
        }

    # Prefer tables closest to the group size (avoid wasting big tables for small groups)
    available.sort(key=lambda t: t["capacity"] - members)
    best = available[0]

    zone_descriptions = {
        "window": "with a lovely window view 🪟",
        "center": "in the lively center area 🎯",
        "counter": "near the food counter for quick pickup 🍽️",
        "entrance": "near the entrance for easy access 🚶"
    }

    zone_desc = zone_descriptions.get(best["zone"], "")

    return {
        "suggestion": best,
        "message": f"🤖 I found the perfect spot! I suggest Table {best['label']} ({best['capacity']}-seater) {zone_desc}. It fits your group of {members} perfectly!"
    }
