# app/main.py
from fastapi import FastAPI
from app.base_datos.conexion import engine, Base
from app.rutas import autor_rutas

# Crea las tablas si no existen (opcional dependiendo de tu configuración)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microservicio de Autores")

# Montamos las rutas del autor
app.include_router(autor_rutas.router, prefix="/api/autores", tags=["Autores"])

@app.get("/")
def root():
    return {"mensaje": "Microservicio de Autores funcionando correctamente"}