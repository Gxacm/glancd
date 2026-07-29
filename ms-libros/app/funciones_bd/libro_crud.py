# app/funciones_bd/libro_crud.py
from sqlalchemy.orm import Session
from uuid import UUID

from app.base_datos.modelos import LibroModelo
from app.esquemas import libro_esquema


def obtener_todos_los_libros(db: Session):
    return db.query(LibroModelo).all()


def crear_libro(db: Session, libro: libro_esquema.LibroCreate, autor_id_generado: str):
    nuevo_libro = LibroModelo(
        titulo=libro.titulo,
        sinopsis=libro.sinopsis,
        url_portada=libro.url_portada,
        edad_objetivo=libro.edad_objetivo,
        isbn=libro.isbn,
        cantidad_paginas=libro.cantidad_paginas,
        fecha_publicacion=libro.fecha_publicacion,
        clasificacion_madurez=libro.clasificacion_madurez,
        proveedor_origen=libro.proveedor_origen,
        google_id=libro.google_id,
        autor_id=autor_id_generado
    )
    db.add(nuevo_libro)
    db.commit()
    db.refresh(nuevo_libro)
    return nuevo_libro


def actualizar_libro(db: Session, libro_id: UUID, libro_data: libro_esquema.LibroCreate, autor_id_generado: str):
    libro = db.query(LibroModelo).filter(LibroModelo.id == libro_id).first()
    if not libro:
        return None
    
    libro.titulo = libro_data.titulo
    libro.sinopsis = libro_data.sinopsis
    libro.url_portada = libro_data.url_portada
    libro.edad_objetivo = libro_data.edad_objetivo
    libro.fecha_publicacion = libro_data.fecha_publicacion
    libro.cantidad_paginas = libro_data.cantidad_paginas
    libro.isbn = libro_data.isbn
    libro.clasificacion_madurez = libro_data.clasificacion_madurez
    libro.proveedor_origen = libro_data.proveedor_origen
    libro.google_id = libro_data.google_id
    libro.autor_id = autor_id_generado 

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