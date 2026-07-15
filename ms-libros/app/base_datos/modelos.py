# app/base_datos/modelos.py
import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.base_datos.conexion import Base

class LibroModelo(Base):
    __tablename__ = "libros"

    # Mapeo exacto de las 8 columnas de la captura
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(255), nullable=False)
    autor_id = Column(UUID(as_uuid=True), nullable=True) # ID de la tabla autores
    sinopsis = Column(Text, nullable=True)
    url_portada = Column(String(255), nullable=True)
    genero_id = Column(Integer, nullable=True) # ID de la tabla generos
    edad_objetivo = Column(Integer, nullable=True)
    creado_en = Column(DateTime, nullable=True)