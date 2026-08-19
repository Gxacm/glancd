# app/esquemas/catalogos_esquema.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

# --- ESQUEMAS DE GÉNEROS ---
class GeneroCreate(BaseModel):
    nombre: str
    clave_google: str
    edad_minima: Optional[int] = 0

class GeneroOut(GeneroCreate):
    id: int
    class Config:
        from_attributes = True

# --- ESQUEMAS DE AUTORES ---
class AutorCreate(BaseModel):
    nombre_completo: str
    biografia: Optional[str] = None
    url_foto: Optional[str] = None

class AutorOut(AutorCreate):
    id: UUID
    class Config:
        from_attributes = True
