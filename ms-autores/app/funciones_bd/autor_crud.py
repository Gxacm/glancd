# app/funciones_bd/autor_crud.py
from sqlalchemy.orm import Session
from app.base_datos.modelos import AutorModelo
from app.esquemas.autor_esquema import AutorCrear

# 1. Importamos nuestro nuevo servicio de Wikipedia
from app.servicios.wikipedia_api import obtener_info_autor_wikipedia

def obtener_autor_por_nombre(db: Session, nombre_completo: str):
    # Buscamos si el autor ya existe para no duplicarlo
    return db.query(AutorModelo).filter(AutorModelo.nombre_completo == nombre_completo).first()

def crear_autor(db: Session, autor: AutorCrear):
    # ==========================================
    # 2. CONSULTAR WIKIPEDIA ANTES DE CREAR
    # ==========================================
    datos_wiki = obtener_info_autor_wikipedia(autor.nombre_completo)
    
    # 3. Lógica de asignación: Si el esquema viene vacío, usamos Wikipedia.
    # Usamos "EMPTY" por defecto si ambas opciones fallan, tal como está en tu BD.
    bio_final = autor.biografia if autor.biografia else datos_wiki.get("biografia", "EMPTY")
    foto_final = autor.url_foto if autor.url_foto else datos_wiki.get("url_foto", "EMPTY")

    # ==========================================
    # 4. CREAR AUTOR EN BASE DE DATOS
    # ==========================================
    nuevo_autor = AutorModelo(
        nombre_completo=autor.nombre_completo,
        biografia=bio_final,
        url_foto=foto_final
    )
    
    db.add(nuevo_autor)
    db.commit()
    db.refresh(nuevo_autor)
    
    return nuevo_autor