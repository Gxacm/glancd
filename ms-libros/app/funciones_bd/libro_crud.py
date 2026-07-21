# app/funciones_bd/libro_crud.py
from sqlalchemy.orm import Session
from uuid import UUID

# 🎯 Aquí sí va la importación desde modelos:
from app.base_datos.modelos import LibroModelo
from app.esquemas import libro_esquema


def obtener_todos_los_libros(db: Session):
    return db.query(LibroModelo).all()


def crear_libro(db: Session, libro: libro_esquema.LibroCreate):
    nuevo_libro = LibroModelo(
        titulo=libro.titulo,
        sinopsis=libro.sinopsis,
        url_portada=libro.url_portada,
        edad_objetivo=libro.edad_objetivo,
        autor_id=libro.autor_id
    )
    db.add(nuevo_libro)
    db.commit()
    db.refresh(nuevo_libro)
    return nuevo_libro


def actualizar_libro(db: Session, libro_id: UUID, libro_data: libro_esquema.LibroCreate):
    libro = db.query(LibroModelo).filter(LibroModelo.id == libro_id).first()
    if not libro:
        return None
    
    libro.titulo = libro_data.titulo
    libro.sinopsis = libro_data.sinopsis
    libro.url_portada = libro_data.url_portada
    libro.edad_objetivo = libro_data.edad_objetivo
    libro.autor_id = libro_data.autor_id

    db.commit()
    db.refresh(libro)
    return libro


def eliminar_libro(db: Session, libro_id: UUID):
    libro = db.query(LibroModelo).filter(LibroModelo.id == libro_id).first()
    if not libro:
        return False
    
    db.delete(libro)
    db.commit()
    return True