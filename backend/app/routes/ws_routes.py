from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio
from app.config import settings

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
