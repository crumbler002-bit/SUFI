import redis
import json
import os
from typing import Any, Optional

class RedisClient:
    def __init__(self):
        self.redis_client = None
        self.redis_available = False
        try:
            self.redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=int(os.getenv("REDIS_DB", 0)),
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            self.redis_available = True
            print("Redis connected successfully")
        except Exception as e:
            print(f"Redis not available: {e}")
            self.redis_available = False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from Redis cache"""
        if not self.redis_available:
            return None
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    def set(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        """Set value in Redis cache with expiration"""
        if not self.redis_available:
            return False
        try:
            json_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, expire_seconds, json_value)
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from Redis cache"""
        if not self.redis_available:
            return False
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in Redis cache"""
        if not self.redis_available:
            return False
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            print(f"Redis exists error: {e}")
            return False

# Global Redis client instance
redis_client = RedisClient()
