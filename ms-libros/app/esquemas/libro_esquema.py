# app/esquemas/libro_esquema.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class AutorSimpleResponse(BaseModel):
    id: UUID
    nombre: str

    model_config = ConfigDict(from_attributes=True)

class LibroResponse(BaseModel):
    id: UUID
    titulo: str
    sinopsis: Optional[str] = None
    url_portada: Optional[str] = None
    edad_objetivo: Optional[int] = None
    autor: Optional[AutorSimpleResponse] = None 

    model_config = ConfigDict(from_attributes=True)