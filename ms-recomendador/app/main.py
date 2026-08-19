from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.rutas.recomendacion_rutas import router

app = FastAPI(title='Microservicio de Recomendaciones - GLANCD')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['GET'],
    allow_headers=['Authorization', 'Content-Type'],
)
app.include_router(router)

@app.get('/health')
def health():
    return {'servicio': 'ms-recomendador', 'estado': 'operativo'}
