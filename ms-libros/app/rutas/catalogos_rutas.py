# app/rutas/catalogos_rutas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.base_datos.conexion import get_db
from app.base_datos.modelos import GeneroModelo
from app.esquemas import catalogos_esquemas
from app.seguridad import requerir_admin
from app.servicios.google_books import obtener_libros_por_genero

router = APIRouter()

# ================================
# RUTAS PARA GÉNEROS
# ================================
@router.get("/generos/", response_model=list[catalogos_esquemas.GeneroOut])
def obtener_generos(db: Session = Depends(get_db)):
    return db.query(GeneroModelo).all()

@router.post("/generos/", response_model=catalogos_esquemas.GeneroOut)
def crear_genero(
    genero: catalogos_esquemas.GeneroCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(requerir_admin),
):
    nuevo_genero = GeneroModelo(
        nombre=genero.nombre,
        clave_google=genero.clave_google,
        edad_minima=genero.edad_minima,
    )
    db.add(nuevo_genero)
    db.commit()
    db.refresh(nuevo_genero)
    return nuevo_genero


@router.get("/generos/{genero_id}/recomendaciones")
def recomendar_por_genero(genero_id: int, db: Session = Depends(get_db)):
    """Devuelve lecturas relacionadas con un género del catálogo."""
    genero = db.query(GeneroModelo).filter(GeneroModelo.id == genero_id).first()
    if not genero:
        raise HTTPException(status_code=404, detail="Género no encontrado")
    return obtener_libros_por_genero(genero.nombre, genero.clave_google)


@router.put("/generos/{genero_id}", response_model=catalogos_esquemas.GeneroOut)
def actualizar_genero(
    genero_id: int,
    datos: catalogos_esquemas.GeneroCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(requerir_admin),
):
    genero = db.query(GeneroModelo).filter(GeneroModelo.id == genero_id).first()
    if not genero:
        raise HTTPException(status_code=404, detail="Género no encontrado")
    genero.nombre = datos.nombre
    genero.clave_google = datos.clave_google
    genero.edad_minima = datos.edad_minima
    db.commit()
    db.refresh(genero)
    return genero


@router.delete("/generos/{genero_id}", status_code=204)
def eliminar_genero(
    genero_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(requerir_admin),
):
    genero = db.query(GeneroModelo).filter(GeneroModelo.id == genero_id).first()
    if not genero:
        raise HTTPException(status_code=404, detail="Género no encontrado")
    try:
        db.delete(genero)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar un género con libros asociados") from error
    return None

