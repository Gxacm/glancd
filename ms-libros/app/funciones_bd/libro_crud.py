# app/funciones_bd/libro_crud.py
from sqlalchemy.orm import Session
from app.base_datos.modelos import LibroModelo

def obtener_todos_los_libros(db: Session):
    return db.query(LibroModelo).all()