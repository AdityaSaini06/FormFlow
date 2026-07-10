from fastapi import APIRouter

from app.api.routes import forms, health, public

api_router = APIRouter()
api_router.include_router(forms.router, tags=["forms"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(public.router, tags=["public"])
