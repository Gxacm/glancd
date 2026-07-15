# app/nucleo/configuracion.py
import os
from dotenv import load_dotenv

# Subimos dos niveles desde app/nucleo/ para encontrar el .env en la raíz
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
load_dotenv(os.path.join(BASE_DIR, ".env"))

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    PORT: int = int(os.getenv("PORT", 8001))

settings = Settings()