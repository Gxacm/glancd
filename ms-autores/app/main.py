# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.base_datos.conexion import engine, Base
from app.rutas import autor_rutas

# Crea las tablas si no existen (opcional dependiendo de tu configuración)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microservicio de Autores")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://glancd.onrender.com"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Montamos las rutas del autor
app.include_router(autor_rutas.router, prefix="/api/autores", tags=["Autores"])

@app.get("/")
def root():
    return {"mensaje": "Microservicio de Autores funcionando correctamente"}

@app.get("/health")
def health():
    return {"servicio": "ms-autores", "estado": "operativo"}
