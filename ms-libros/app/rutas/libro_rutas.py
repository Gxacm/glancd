# app/rutas/libro_rutas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.base_datos.conexion import get_db
from app.esquemas.libro_esquema import LibroResponse, LibroCreate
from app.seguridad import obtener_usuario_actual
from app.funciones_bd import libro_crud

router = APIRouter(prefix="/api/libros", tags=["Libros"])

# 1. Obtener todos los libros
@router.get("/", response_model=List[LibroResponse])
def listar_libros(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    return libro_crud.obtener_todos_los_libros(db)

# 2. 🆕 Crear un nuevo libro
@router.post("/", response_model=LibroResponse, status_code=status.HTTP_201_CREATED)
def agregar_libro(
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    return libro_crud.crear_libro(db=db, libro=libro)

# 3. 🆕 Editar un libro existente
@router.put("/{libro_id}", response_model=LibroResponse)
def editar_libro(
    libro_id: UUID,
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    libro_actualizado = libro_crud.actualizar_libro(db=db, libro_id=libro_id, libro_data=libro)
    if not libro_actualizado:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro_actualizado

# 4. 🆕 Eliminar un libro
@router.delete("/{libro_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_libro(
    libro_id: UUID,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    exito = libro_crud.eliminar_libro(db=db, libro_id=libro_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return None