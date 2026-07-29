# app/rutas/libro_rutas.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import requests

from app.base_datos.conexion import get_db
from app.esquemas.libro_esquema import LibroResponse, LibroCreate
from app.seguridad import obtener_usuario_actual
from app.funciones_bd import libro_crud
from app.servicios.google_books import buscar_libros

router = APIRouter(prefix="/api/libros", tags=["Libros"])

# Función auxiliar reutilizable para gestionar el autor de forma limpia
def obtener_o_crear_autor_remoto(nombre_completo: str) -> str:
    url_ms_autores = "http://127.0.0.1:8002/api/autores/"
    payload = {"nombre_completo": nombre_completo}
    
    try:
        respuesta = requests.post(url_ms_autores, json=payload)
        respuesta.raise_for_status()
        datos_autor = respuesta.json()
        return datos_autor["id"]
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503, 
            detail=f"El servicio de autores no está disponible. Detalles: {str(e)}"
        )

# 1. Obtener todos los libros
@router.get("/", response_model=List[LibroResponse])
def listar_libros(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    return libro_crud.obtener_todos_los_libros(db)

# 2. 🆕 Crear un nuevo libro (Con comunicación a ms-autores)
@router.post("/", response_model=LibroResponse, status_code=status.HTTP_201_CREATED)
def agregar_libro(
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    # Llamamos al ms-autores para obtener el ID usando el nombre que envió el usuario
    autor_id_generado = obtener_o_crear_autor_remoto(libro.nombre_autor)
    
    # Guardamos el libro pasándole el ID obtenido
    return libro_crud.crear_libro(db=db, libro=libro, autor_id_generado=autor_id_generado)

# 3. 🆕 Editar un libro existente (Con comunicación a ms-autores)
@router.put("/{libro_id}", response_model=LibroResponse)
def editar_libro(
    libro_id: UUID,
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    # Si al editar también cambiaron o ingresaron un autor, lo gestionamos
    autor_id_generado = obtener_o_crear_autor_remoto(libro.nombre_autor)

    libro_actualizado = libro_crud.actualizar_libro(
        db=db, 
        libro_id=libro_id, 
        libro_data=libro, 
        autor_id_generado=autor_id_generado
    )
    if not libro_actualizado:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro_actualizado

# 4. 🆕 Eliminar un libro
@router.delete("/{libro_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_libro(
    libro_id: UUID,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    exito = libro_crud.eliminar_libro(db=db, libro_id=libro_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return None

# 5. 🆕 Buscar libros al vuelo (Híbrido)
@router.get("/buscar")
def buscar_libros_al_vuelo(
    q: str = Query(..., description="Término de búsqueda. Ej: Dune, Harry Potter"),
):
    """
    Busca libros en tiempo real usando Google Books como principal
    y Open Library como respaldo.
    """
    if not q or q.strip() == "":
        raise HTTPException(status_code=400, detail="El término de búsqueda no puede estar vacío.")
    
    # Llamamos a nuestra nueva función híbrida
    resultados = buscar_libros(query=q)
    
    if not resultados:
        return {"mensaje": "No se encontraron libros para tu búsqueda.", "resultados": []}
        
    return {"resultados": resultados}
