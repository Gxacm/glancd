# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .rutas import libro_rutas

app = FastAPI(title="Microservicio de Libros - GLANCD")

# CORS habilitado para que React pueda consumir esta API sin bloqueos de seguridad
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectamos las rutas de libros al servidor principal
app.include_router(libro_rutas.router)

@app.get("/")
def home():
    return {"servicio": "ms-libros", "estado": "operativo", "puerto": 8001}