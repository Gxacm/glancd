# app/rutas/libro_rutas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.base_datos.conexion import get_db
from app.esquemas.libro_esquema import LibroResponse
# 🔄 Asegúrate de que use el guion bajo aquí:
from app.funciones_bd import libro_crud 

router = APIRouter(prefix="/api/libros", tags=["Libros"])

@router.get("/", response_model=List[LibroResponse])
def listar_libros(db: Session = Depends(get_db)):
    try:
        libros = libro_crud.obtener_todos_los_libros(db)
        return libros
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la BD: {str(e)}")