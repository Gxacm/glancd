# app/esquemas/libro_esquema.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class AutorSimpleResponse(BaseModel):
    id: UUID
    nombre_completo: str

    model_config = ConfigDict(from_attributes=True)

# 🆕 Esquema para los datos recibidos al Crear/Editar
class LibroCreate(BaseModel):
    titulo: str
    sinopsis: Optional[str] = None
    url_portada: Optional[str] = None
    edad_objetivo: Optional[int] = 0
    nombre_autor: str 
    fecha_publicacion: Optional[str] = None
    cantidad_paginas: Optional[int] = 0
    isbn: Optional[str] = None
    clasificacion_madurez: Optional[str] = None
    proveedor_origen: Optional[str] = None
    google_id: Optional[str] = None

class LibroResponse(BaseModel):
    id: UUID
    titulo: str
    sinopsis: Optional[str] = None
    url_portada: Optional[str] = None
    edad_objetivo: Optional[int] = None
    autor: Optional[AutorSimpleResponse] = None 

    model_config = ConfigDict(from_attributes=True)
