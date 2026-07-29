# app/base_datos/conexion.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Cargar variables de entorno (tu archivo .env)
load_dotenv()

# Asegúrate de tener la variable DATABASE_URL en tu archivo .env
# Debe ser la misma URL de conexión a Supabase que usaste en ms-libros
URL_BASE_DATOS = os.getenv("DATABASE_URL")

# Si por alguna razón os.getenv falla, te avisará
if not URL_BASE_DATOS:
    raise ValueError("⚠️ No se encontró DATABASE_URL en las variables de entorno.")

# Crear el 'engine' que pedía tu main.py
engine = create_engine(URL_BASE_DATOS)

# Crear el generador de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para tus modelos
Base = declarative_base()

# Dependencia para inyectar la sesión en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()