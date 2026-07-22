# app/rutas/catalogos_rutas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.base_datos.conexion import get_db
from app.base_datos.modelos import AutorModelo, GeneroModelo
from app.esquemas import catalogos_esquemas

router = APIRouter()

# ================================
# RUTAS PARA GÉNEROS
# ================================
@router.get("/generos/", response_model=list[catalogos_esquemas.GeneroOut])
def obtener_generos(db: Session = Depends(get_db)):
    return db.query(GeneroModelo).all()

@router.post("/generos/", response_model=catalogos_esquemas.GeneroOut)
def crear_genero(genero: catalogos_esquemas.GeneroCreate, db: Session = Depends(get_db)):
    nuevo_genero = GeneroModelo(nombre=genero.nombre, edad_minima=genero.edad_minima)
    db.add(nuevo_genero)
    db.commit()
    db.refresh(nuevo_genero)
    return nuevo_genero

# ================================
# RUTAS PARA AUTORES
# ================================
@router.get("/autores/", response_model=list[catalogos_esquemas.AutorOut])
def obtener_autores(db: Session = Depends(get_db)):
    return db.query(AutorModelo).all()

@router.post("/autores/", response_model=catalogos_esquemas.AutorOut)
def crear_autor(autor: catalogos_esquemas.AutorCreate, db: Session = Depends(get_db)):
    nuevo_autor = AutorModelo(
        nombre=autor.nombre,
        apellido=autor.apellido,
        biografia=autor.biografia,
        url_foto=autor.url_foto
    )
    db.add(nuevo_autor)
    db.commit()
    db.refresh(nuevo_autor)
    return nuevo_autor