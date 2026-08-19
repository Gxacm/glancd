# app/esquemas/libro_esquema.py
from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional
from uuid import UUID

class AutorSimpleResponse(BaseModel):
    id: UUID
    nombre_completo: str

    model_config = ConfigDict(from_attributes=True)

class GeneroSimpleResponse(BaseModel):
    id: int
    nombre: str
    clave_google: str

    model_config = ConfigDict(from_attributes=True)

# 🆕 Esquema para los datos recibidos al Crear/Editar
class LibroCreate(BaseModel):
    titulo: str
    sinopsis: Optional[str] = None
    url_portada: Optional[str] = None
    edad_objetivo: Optional[int] = 0
    autor_id: Optional[UUID] = None
    nombre_autor: Optional[str] = None
    genero_id: Optional[int] = None
    fecha_publicacion: Optional[str] = None
    cantidad_paginas: Optional[int] = 0
    isbn: Optional[str] = None
    clasificacion_madurez: Optional[str] = None
    proveedor_origen: Optional[str] = None
    google_id: Optional[str] = None

    @model_validator(mode="after")
    def validar_autor(self):
        if not self.autor_id and not (self.nombre_autor and self.nombre_autor.strip()):
            raise ValueError("Debes proporcionar autor_id o nombre_autor.")
        return self

class LibroResponse(BaseModel):
    id: UUID
    titulo: str
    sinopsis: Optional[str] = None
    url_portada: Optional[str] = None
    edad_objetivo: Optional[int] = None
    autor_id: UUID
    genero_id: Optional[int] = None
    google_id: Optional[str] = None
    cantidad_paginas: Optional[int] = None
    fecha_publicacion: Optional[str] = None
    clasificacion_madurez: Optional[str] = None
    proveedor_origen: Optional[str] = None
    autor: Optional[AutorSimpleResponse] = None
    genero: Optional[GeneroSimpleResponse] = None

    model_config = ConfigDict(from_attributes=True)
