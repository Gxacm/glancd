from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from uuid import UUID
import requests

from app.base_datos.conexion import get_db
from app.esquemas.libro_esquema import LibroResponse, LibroCreate
from app.seguridad import obtener_usuario_actual
from app.funciones_bd import libro_crud
from app.servicios.google_books import buscar_libros, obtener_recomendaciones_multiples_generos

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

# 1. Obtener todos los libros del catálogo interno
@router.get("/", response_model=List[LibroResponse])
def listar_libros(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    return libro_crud.obtener_todos_los_libros(db)

# 2. 🆕 Obtener recomendaciones personalizadas por género (Google Books / Open Library)
@router.get("/recomendados/{usuario_id}")
async def obtener_libros_recomendados(
    usuario_id: str,
    db: Session = Depends(get_db)
):
    """
    Lee los géneros preferidos del usuario y ejecuta búsquedas paralelas 
    en la API de Google Books/Open Library para cada género.
    """
    try:
        sql = text("""
            SELECT g.nombre, g.clave_google 
            FROM usuario_generos ug
            JOIN generos g ON ug.genero_id = g.id
            WHERE ug.usuario_id = :usuario_id
        """)
        
        resultado = db.execute(sql, {"usuario_id": usuario_id}).mappings().all()
        
        if not resultado:
            return []

        generos_usuario = [
            {"nombre": row["nombre"], "clave_google": row["clave_google"]} 
            for row in resultado
        ]

        recomendaciones = await obtener_recomendaciones_multiples_generos(generos_usuario)
        return recomendaciones

    except Exception as error:
        print(f"Error obteniendo recomendados: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al generar las recomendaciones."
        )

# 3. Crear un nuevo libro
@router.post("/", response_model=LibroResponse, status_code=status.HTTP_201_CREATED)
def agregar_libro(
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    autor_id_generado = obtener_o_crear_autor_remoto(libro.nombre_autor)
    return libro_crud.crear_libro(db=db, libro=libro, autor_id_generado=autor_id_generado)

# 4. Editar un libro existente
@router.put("/{libro_id}", response_model=LibroResponse)
def editar_libro(
    libro_id: UUID,
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
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

# 5. Eliminar un libro
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

# 6. Buscar libros al vuelo (Híbrido)
@router.get("/buscar")
def buscar_libros_al_vuelo(
    q: str = Query(..., description="Término de búsqueda. Ej: Dune, Harry Potter"),
):
    if not q or q.strip() == "":
        raise HTTPException(status_code=400, detail="El término de búsqueda no puede estar vacío.")
    
    resultados = buscar_libros(query=q)
    
    if not resultados:
        return {"mensaje": "No se encontraron libros para tu búsqueda.", "resultados": []}
        
    return {"resultados": resultados}