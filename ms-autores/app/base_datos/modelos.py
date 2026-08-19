# app/base_datos/modelos.py
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.base_datos.conexion import Base
import uuid

class AutorModelo(Base):
    __tablename__ = "autores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_completo = Column(String(100), nullable=False)
    biografia = Column(Text, nullable=True, default="")
    url_foto = Column(Text, nullable=True, default="")
    creado_en = Column(DateTime, default=datetime.now)
