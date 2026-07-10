from fastapi import APIRouter

from app.api.routes import forms, health

api_router = APIRouter()
api_router.include_router(forms.router, tags=["forms"])
api_router.include_router(health.router, tags=["health"])
