# app/base_datos/modelos.py
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.base_datos.conexion import Base


class AutorModelo(Base):
    __tablename__ = "autores"

    id = Column(UUID(as_uuid=True), primary_key=True)
    nombre = Column(String, nullable=False)
    biografia = Column(Text, nullable=True)
    url_foto = Column(String, nullable=True)

    libros = relationship("LibroModelo", back_populates="autor")


class LibroModelo(Base):
    __tablename__ = "libros"

    id = Column(UUID(as_uuid=True), primary_key=True)
    titulo = Column(String, nullable=False)
    autor_id = Column(UUID(as_uuid=True), ForeignKey("autores.id"), nullable=True)
    sinopsis = Column(Text, nullable=True)
    url_portada = Column(String, nullable=True)
    genero_id = Column(Integer, nullable=True)
    edad_objetivo = Column(Integer, nullable=True)

    autor = relationship("AutorModelo", back_populates="libros")