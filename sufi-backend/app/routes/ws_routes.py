from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio
from datetime import date
from app.config import settings
from app.database import SessionLocal

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
        # Try to connect to Redis
        try:
            import redis
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                decode_responses=True
            )
            self.redis_client.ping()
            self.pubsub = self.redis_client.pubsub()
            asyncio.create_task(self.redis_listener())
            self.redis_available = True
        except:
            self.redis_client = None
            self.redis_available = False
            print("Redis not available - WebSocket broadcasts will be local only")

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if self.active_connections:
            # Send to WebSocket clients
            for connection in self.active_connections:
                try:
                    await connection.send_json(message)
                except:
                    # Remove dead connections
                    self.disconnect(connection)
        
        # Also publish to Redis for cross-server synchronization
        if self.redis_available and self.redis_client:
            self.redis_client.publish("reservation_updates", json.dumps(message))

    async def redis_listener(self):
        """Listen for Redis messages and broadcast to WebSocket clients"""
        if not self.redis_available or not self.redis_client:
            return
            
        self.pubsub.subscribe("reservation_updates")
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    await self.broadcast(data)
                except:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/reservations")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            await manager.send_personal_message(f"Received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def broadcast_reservation_update(restaurant_id: int, table_id: int, reservation_time: str):
    """Broadcast reservation update to all connected clients"""
    message = {
        "type": "table_reserved",
        "restaurant_id": restaurant_id,
        "table_id": table_id,
        "reservation_time": reservation_time
    }
    await manager.broadcast(message)

async def broadcast_availability_update(restaurant_id: int, available_tables: list):
    """Broadcast availability update for a restaurant"""
    message = {
        "type": "availability_update",
        "restaurant_id": restaurant_id,
        "available_tables": available_tables
    }
    await manager.broadcast(message)


# ── Live intelligence dashboard WebSocket ─────────────────────────────────────

@router.websocket("/ws/dashboard/{restaurant_id}")
async def dashboard_ws(websocket: WebSocket, restaurant_id: int):
    """
    Streams live intelligence dashboard data every 10 seconds.
    Payload mirrors GET /owner/intelligence/dashboard/{restaurant_id}.
    No auth on WS — restaurant_id scoping is the access boundary for now.
    """
    from app.services.intelligence.decision_engine import build_owner_dashboard
    from app.services.ml.revenue import get_occupancy_rate

    await websocket.accept()
    try:
        while True:
            db = SessionLocal()
            try:
                dashboard = build_owner_dashboard(db, restaurant_id)
                occupancy = get_occupancy_rate(db, restaurant_id)
                payload = {
                    "type": "dashboard_update",
                    "restaurant_id": restaurant_id,
                    "occupancy": occupancy,
                    "live_reservations": dashboard["metrics"]["total_reservations"],
                    "demand_level": dashboard["metrics"]["demand_level"],
                    "fill_ratio": dashboard["metrics"]["fill_ratio"],
                    "predicted_revenue": dashboard["predictions"]["predicted_revenue"],
                    "waitlist_waiting": dashboard["waitlist"]["waiting"],
                    "insights": dashboard["insights"],
                    "hourly_demand": dashboard["predictions"]["hourly_demand"],
                    "predicted_hourly": dashboard["predictions"]["predicted_hourly_demand"],
                }
            except Exception as exc:
                payload = {"type": "error", "message": str(exc)}
            finally:
                db.close()

            await websocket.send_json(payload)
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        pass


# ── Owner real-time notification WebSocket ────────────────────────────────────

@router.websocket("/ws/owner/{restaurant_id}")
async def owner_ws(websocket: WebSocket, restaurant_id: int):
    """
    Persistent connection for owner real-time notifications.
    Registered in notification_service so create_notification() can push instantly.
    """
    from app.services.notification_service import register_owner_ws, unregister_owner_ws

    await websocket.accept()
    register_owner_ws(restaurant_id, websocket)
    try:
        while True:
            # Keep alive — client can send pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        unregister_owner_ws(restaurant_id, websocket)
