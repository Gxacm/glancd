# app/rutas/libro_rutas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.base_datos.conexion import get_db
from app.esquemas.libro_esquema import LibroResponse
from app.seguridad import obtener_usuario_actual

# 🎯 Importación exacta desde app/funciones_bd/libros_crud.py
from app.funciones_bd.libro_crud import obtener_todos_los_libros

router = APIRouter(prefix="/api/libros", tags=["Libros"])

@router.get("/", response_model=List[LibroResponse])
def listar_libros(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual) # 🔐 ¡Protegido con JWT!
):
    """
    Obtiene el catálogo de libros. Requiere Token JWT válido en el header Authorization.
    """
    return obtener_todos_los_libros(db)