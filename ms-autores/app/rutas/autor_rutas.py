# app/rutas/autor.rutas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.base_datos.conexion import get_db
from app.funciones_bd import autor_crud
from app.esquemas import autor_esquema
from app.seguridad import obtener_usuario_actual, requerir_admin

router = APIRouter()

@router.get("/", response_model=list[autor_esquema.AutorRespuesta])
def listar_autores(db: Session = Depends(get_db)):
    return autor_crud.obtener_autores(db)

@router.get("/{autor_id}", response_model=autor_esquema.AutorRespuesta)
def obtener_autor(autor_id: UUID, db: Session = Depends(get_db)):
    autor = autor_crud.obtener_autor_por_id(db, autor_id)
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return autor

@router.post("/", response_model=autor_esquema.AutorRespuesta)
def crear_o_obtener_autor(
    autor: autor_esquema.AutorCrear,
    db: Session = Depends(get_db),
    _: dict = Depends(obtener_usuario_actual),
):
    
    # 1. Buscamos al autor por su nombre completo
    autor_existente = autor_crud.obtener_autor_por_nombre(
        db, nombre_completo=autor.nombre_completo
    )
    
    # 2. Si ya está en la base de datos, simplemente devolvemos sus datos (incluyendo su UUID)
    if autor_existente:
        return autor_existente
    
    # 3. Si no existe, usamos el CRUD para crearlo desde cero
    return autor_crud.crear_autor(db=db, autor=autor)

@router.put("/{autor_id}", response_model=autor_esquema.AutorRespuesta)
def actualizar_autor(
    autor_id: UUID,
    autor: autor_esquema.AutorCrear,
    db: Session = Depends(get_db),
    _: dict = Depends(requerir_admin),
):
    actualizado = autor_crud.actualizar_autor(db, autor_id, autor)
    if not actualizado:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return actualizado

@router.delete("/{autor_id}", status_code=204)
def eliminar_autor(
    autor_id: UUID,
    db: Session = Depends(get_db),
    _: dict = Depends(requerir_admin),
):
    try:
        eliminado = autor_crud.eliminar_autor(db, autor_id)
    except Exception as error:
        raise HTTPException(status_code=409, detail="No se puede eliminar un autor con libros asociados") from error
    if not eliminado:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
