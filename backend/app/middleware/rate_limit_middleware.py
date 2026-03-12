import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests = defaultdict(list)
        self.rate_limit = settings.RATE_LIMIT_REQUESTS
        self.window = settings.RATE_LIMIT_WINDOW

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < self.window
        ]
        
        # Check rate limit
        if len(self.requests[client_ip]) >= self.rate_limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.rate_limit} requests per {self.window} seconds."
            )
        
        # Add current request
        self.requests[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        return response

class LoginRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.login_attempts = defaultdict(list)
        self.max_attempts = 5
        self.window = 60  # 1 minute

    async def dispatch(self, request: Request, call_next):
        # Only apply to login endpoint
        if "/auth/login" in str(request.url):
            client_ip = request.client.host
            current_time = time.time()
            
            # Clean old attempts
            self.login_attempts[client_ip] = [
                attempt_time for attempt_time in self.login_attempts[client_ip]
                if current_time - attempt_time < self.window
            ]
            
            # Check login attempts
            if len(self.login_attempts[client_ip]) >= self.max_attempts:
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many login attempts. Try again in {self.window} seconds."
                )
            
            # Add current attempt
            self.login_attempts[client_ip].append(current_time)
        
        response = await call_next(request)
        return response
