import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
import json

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {response.status_code} - "
            f"Time: {process_time:.4f}s - "
            f"URL: {request.url}"
        )
        
        # Log slow requests (> 1 second)
        if process_time > 1.0:
            logger.warning(
                f"Slow request detected: {request.method} {request.url} "
                f"took {process_time:.4f}s"
            )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Log security-relevant requests
        if any(path in str(request.url) for path in ["/auth/login", "/auth/register"]):
            client_ip = request.client.host
            user_agent = request.headers.get("user-agent", "Unknown")
            
            logger.info(
                f"Security Event: {request.method} {request.url} "
                f"from IP: {client_ip} - User-Agent: {user_agent}"
            )
        
        response = await call_next(request)
        
        # Log authentication failures
        if response.status_code == 401:
            logger.warning(
                f"Authentication failed for: {request.method} {request.url} "
                f"from IP: {request.client.host}"
            )
        
        # Log authorization failures
        if response.status_code == 403:
            logger.warning(
                f"Authorization failed for: {request.method} {request.url} "
                f"from IP: {request.client.host}"
            )
        
        return response

class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Log detailed error information
            logger.error(
                f"Unhandled exception: {str(e)} - "
                f"URL: {request.url} - "
                f"Method: {request.method} - "
                f"Client IP: {request.client.host}"
            )
            
            # Re-raise the exception to let FastAPI handle it
            raise e
