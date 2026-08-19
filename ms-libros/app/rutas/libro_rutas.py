from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from uuid import UUID
import uuid
import requests

from app.base_datos.conexion import get_db
from app.esquemas.libro_esquema import LibroResponse, LibroCreate
from app.seguridad import obtener_usuario_actual, requerir_admin
from app.funciones_bd import libro_crud
from app.servicios.google_books import buscar_libros, obtener_recomendaciones_multiples_generos, obtener_detalle_google_book, obtener_libros_en_tendencia
from app.nucleo.configuracion import settings
router = APIRouter(prefix="/api/libros", tags=["Libros"])

# Función auxiliar reutilizable para gestionar el autor de forma limpia
def obtener_o_crear_autor_remoto(nombre_completo: str, authorization: str) -> UUID:
    url_ms_autores = f"{settings.MS_AUTORES_URL.rstrip('/')}/api/autores/"
    payload = {"nombre_completo": nombre_completo}
    
    try:
        respuesta = requests.post(
            url_ms_autores,
            json=payload,
            headers={"Authorization": authorization},
            timeout=5,
        )
        respuesta.raise_for_status()
        datos_autor = respuesta.json()
        return UUID(datos_autor["id"])
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503, 
            detail=f"El servicio de autores no está disponible. Detalles: {str(e)}"
        )

# 1. Obtener todos los libros del catálogo interno
@router.get("/", response_model=List[LibroResponse])
def listar_libros(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(requerir_admin)
):
    return libro_crud.obtener_todos_los_libros(db)

# 2. 🆕 Obtener recomendaciones personalizadas por género (Google Books / Open Library)
@router.get("/recomendados")
async def obtener_libros_recomendados(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual),
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
        
        resultado = db.execute(sql, {"usuario_id": usuario_actual["id"]}).mappings().all()
        
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

# 3. Buscar libros al vuelo (Híbrido)
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


@router.get("/tendencias")
def obtener_tendencias(limite: int = Query(10, ge=1, le=40)):
    return {"libros": obtener_libros_en_tendencia(limite)}

# 4 Obtener un libro específico por su ID (Híbrido: BD Local o Google Books)
@router.get("/{libro_id}")
def obtener_libro(
    libro_id: str,
    db: Session = Depends(get_db)
):
    # 1. Intentamos ver si el ID pertenece a nuestra BD local (Si es un UUID válido)
    try:
        id_uuid = uuid.UUID(libro_id)
        libro_local = libro_crud.obtener_libro_por_id(db=db, libro_id=id_uuid)
        if libro_local:
            return libro_local
    except ValueError:
        # Si falla al convertir a UUID, significa que es un ID de Google Books. Pasamos al paso 2.
        pass

    # Un libro consultado inicialmente desde Google puede ya haber sido guardado
    # por un like o una reseña. En ese caso devolvemos su registro local y su UUID.
    libro_local = libro_crud.obtener_libro_por_google_id(db=db, google_id=libro_id)
    if libro_local:
        return libro_local
        
    # 2. Si no es UUID o no estaba en la BD, buscamos los detalles en Google Books
    libro_google = obtener_detalle_google_book(libro_id)
    if libro_google:
        return libro_google
        
    # 3. Si no está en ningún lado
    raise HTTPException(status_code=404, detail="Libro no encontrado ni en base de datos ni en Google Books.")

# 5. Crear un nuevo libro
@router.post("/", response_model=LibroResponse, status_code=status.HTTP_201_CREATED)
def agregar_libro(
    libro: LibroCreate,
    request: Request,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    # Guardar desde Google Books debe ser idempotente: un mismo libro puede
    # llegar desde "like" y desde "reseña" sin provocar una clave duplicada.
    if libro.google_id:
        existente = libro_crud.obtener_libro_por_google_id(db=db, google_id=libro.google_id)
        if existente:
            return existente

    authorization = request.headers.get("Authorization", "")
    autor_id = libro.autor_id or obtener_o_crear_autor_remoto(libro.nombre_autor, authorization)
    return libro_crud.crear_libro(db=db, libro=libro, autor_id=autor_id)

# 6. Editar un libro existente
@router.put("/{libro_id}", response_model=LibroResponse)
def editar_libro(
    libro_id: UUID,
    libro: LibroCreate,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(requerir_admin)
):
    autor_id = libro.autor_id or obtener_o_crear_autor_remoto(libro.nombre_autor)

    libro_actualizado = libro_crud.actualizar_libro(
        db=db, 
        libro_id=libro_id, 
        libro_data=libro, 
        autor_id=autor_id
    )
    if not libro_actualizado:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro_actualizado

# 7. Eliminar un libro
@router.delete("/{libro_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_libro(
    libro_id: UUID,
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(requerir_admin)
):
    exito = libro_crud.eliminar_libro(db=db, libro_id=libro_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return None

