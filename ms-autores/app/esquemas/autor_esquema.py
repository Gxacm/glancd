# app/esquemas/autor.esquema.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# Lo que es común para todos
class AutorBase(BaseModel):
    nombre_completo: str
    biografia: Optional[str] = None
    url_foto: Optional[str] = None

# Lo que pedimos para crear (hereda de Base)
class AutorCrear(AutorBase):
    pass

# Lo que devolvemos al frontend
class AutorRespuesta(AutorBase):
    id: UUID
    creado_en: datetime

    class Config:
        from_attributes = True