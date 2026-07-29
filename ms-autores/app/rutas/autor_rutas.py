# app/rutas/autor.rutas.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.base_datos.conexion import get_db
from app.funciones_bd import autor_crud
from app.esquemas import autor_esquema

router = APIRouter()

@router.post("/", response_model=autor_esquema.AutorRespuesta)
def crear_o_obtener_autor(autor: autor_esquema.AutorCrear, db: Session = Depends(get_db)):
    
    # 1. Buscamos al autor por su nombre completo
    autor_existente = autor_crud.obtener_autor_por_nombre(
        db, nombre_completo=autor.nombre_completo
    )
    
    # 2. Si ya está en la base de datos, simplemente devolvemos sus datos (incluyendo su UUID)
    if autor_existente:
        return autor_existente
    
    # 3. Si no existe, usamos el CRUD para crearlo desde cero
    return autor_crud.crear_autor(db=db, autor=autor)
