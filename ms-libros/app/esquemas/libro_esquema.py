# app/esquemas/libro_esquema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# Estructura base con las propiedades reales de la tabla
class LibroBase(BaseModel):
    titulo: str
    autor_id: Optional[UUID] = None
    sinopsis: Optional[str] = None
    url_portada: Optional[str] = None
    genero_id: Optional[int] = None
    edad_objetivo: Optional[int] = None
    creado_en: Optional[datetime] = None

# Esquema para devolver datos al cliente (incluye el ID tipo UUID)
class LibroResponse(LibroBase):
    id: UUID

    class Config:
        from_attributes = True # Permite mapear desde SQLAlchemy