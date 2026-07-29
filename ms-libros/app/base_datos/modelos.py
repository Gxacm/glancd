# app/base_datos/modelos.py
from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime 
from app.base_datos.conexion import Base
import uuid

class GeneroModelo(Base):
    __tablename__ = "generos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False)
    edad_minima = Column(Integer, nullable=True)

class AutorModelo(Base):
    __tablename__ = "autores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_completo = Column(String(200), nullable=False)
    biografia = Column(Text, nullable=True)
    url_foto = Column(String(255), nullable=True)
    creado_en = Column(DateTime, default=datetime.now)
    
    # Esta relación ahora funcionará perfectamente:
    libros = relationship("LibroModelo", back_populates="autor")

class LibroModelo(Base):
    __tablename__ = "libros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String(255), nullable=False)
    sinopsis = Column(Text, nullable=True)
    url_portada = Column(String(255), nullable=True)
    edad_objetivo = Column(Integer, nullable=True)
    creado_en = Column(DateTime, default=datetime.now)
    
    # 👈 AQUÍ ESTÁ LA MAGIA: Conexión con la tabla autores
    autor_id = Column(UUID(as_uuid=True), ForeignKey("autores.id"), nullable=False)
    autor = relationship("AutorModelo", back_populates="libros")
    
    # Campos adicionales del diagrama:
    google_id = Column(String(255), nullable=True)
    isbn = Column(String(50), unique=True, nullable=True)
    cantidad_paginas = Column(Integer, nullable=True)
    fecha_publicacion = Column(String(50), nullable=True)
    clasificacion_madurez = Column(String(50), nullable=True)
    proveedor_origen = Column(String(50), nullable=True)
