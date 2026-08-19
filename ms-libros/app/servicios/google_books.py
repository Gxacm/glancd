# app/servicios/google_books.py
import requests
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

def buscar_libros(query: str):
    """
    Busca libros en Google Books (Principal). 
    Si falla, utiliza Open Library como respaldo (Fallback).
    """
    
    # ==========================================
    # 1. INTENTO PRINCIPAL: GOOGLE BOOKS API
    # ==========================================
    url_google = f"https://www.googleapis.com/books/v1/volumes?q={query}"
    if API_KEY:
        url_google += f"&key={API_KEY}"
        
    try:
        respuesta_google = requests.get(url_google, timeout=5)
        respuesta_google.raise_for_status()
        datos_google = respuesta_google.json()
        
        if "items" in datos_google:
            resultados = []
            for item in datos_google["items"]:
                info = item.get("volumeInfo", {})
                
                # --- HACK DE ALTA CALIDAD PARA GOOGLE BOOKS ---
                url_portada = info.get("imageLinks", {}).get("thumbnail", "").replace("http:", "https:")
                if url_portada:
                    url_portada = url_portada.replace("zoom=1", "zoom=3").replace("&edge=curl", "")
                
                resultados.append({
                    "origen": "Google Books",
                    "google_id": item.get("id"),
                    "titulo": info.get("title", "Sin título"),
                    "nombre_autor": info.get("authors", ["Autor Desconocido"])[0],
                    "sinopsis": info.get("description", ""),
                    "fecha_publicacion": info.get("publishedDate", ""),
                    "cantidad_paginas": info.get("pageCount", 0),
                    "url_portada": url_portada or "https://via.placeholder.com/180x260?text=Sin+Portada"
                })
            return resultados
            
    except Exception as e:
        print(f"⚠️ Google Books falló ({e}). Cambiando a Open Library...")

    # ==========================================
    # 2. INTENTO DE RESPALDO: OPEN LIBRARY API
    # ==========================================
    url_open = f"https://openlibrary.org/search.json?q={query}&limit=5"
    try:
        respuesta_open = requests.get(url_open, timeout=5)
        respuesta_open.raise_for_status()
        datos_open = respuesta_open.json()
        
        if "docs" in datos_open:
            resultados = []
            for doc in datos_open["docs"]:
                cover_id = doc.get("cover_i")
                url_portada_open = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg" if cover_id else ""
                
                resultados.append({
                    "origen": "Open Library",
                    "google_id": doc.get("key", ""),
                    "titulo": doc.get("title", "Sin título"),
                    "nombre_autor": doc.get("author_name", ["Autor Desconocido"])[0] if doc.get("author_name") else "Autor Desconocido",
                    "sinopsis": "",
                    "fecha_publicacion": str(doc.get("first_publish_year", "")),
                    "cantidad_paginas": doc.get("number_of_pages_median", 0),
                    "url_portada": url_portada_open or "https://via.placeholder.com/180x260?text=Sin+Portada"
                })
            return resultados
            
    except Exception as e:
        print(f"⚠️ Open Library también falló: {e}")

    return []


def obtener_libros_en_tendencia(limite: int = 10):
    """Catálogo público de bienvenida, servido desde backend para evitar CORS."""
    url = f"https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults={min(max(limite, 1), 40)}"
    if API_KEY:
        url += f"&key={API_KEY}"
    try:
        respuesta = requests.get(url, timeout=8)
        respuesta.raise_for_status()
        items = respuesta.json().get("items", [])
        return [
            {
                "id": item.get("id"),
                "titulo": item.get("volumeInfo", {}).get("title", "Sin título"),
                "autor": ", ".join(item.get("volumeInfo", {}).get("authors", ["Autor desconocido"])),
                "portada": item.get("volumeInfo", {}).get("imageLinks", {}).get("thumbnail", "").replace("http:", "https:") or "https://via.placeholder.com/150x220?text=Sin+Portada",
                "categoria": (item.get("volumeInfo", {}).get("categories") or ["Lecturas destacadas"])[0],
            }
            for item in items
            if item.get("id")
        ]
    except requests.RequestException as error:
        print(f"Error obteniendo tendencias de Google Books: {error}")
        return []


# ==========================================
# NUEVAS FUNCIONES PARA RECOMENDACIONES POR GÉNERO
# ==========================================

def obtener_libros_por_genero(nombre_genero: str, clave_google: str = None):
    """Busca libros para un género usando subject: e invocando buscar_libros."""
    termino = clave_google if clave_google else nombre_genero
    query = f"subject:{termino}"
    
    libros = buscar_libros(query)
    
    return {
        "genero": nombre_genero,
        "clave_google": clave_google or nombre_genero,
        "libros": libros
    }


async def obtener_recomendaciones_multiples_generos(generos: list):
    """Ejecuta búsquedas paralelas para múltiples géneros sin bloquear el hilo principal."""
    loop = asyncio.get_running_loop()
    
    with ThreadPoolExecutor() as executor:
        tareas = [
            loop.run_in_executor(
                executor, 
                obtener_libros_por_genero, 
                g.get("nombre"), 
                g.get("clave_google")
            )
            for g in generos
        ]
        resultados = await asyncio.gather(*tareas)
        
    return resultados

def obtener_detalle_google_book(google_id: str):
    """Obtiene los detalles de un libro específico directamente desde Google Books usando su ID."""
    url = f"https://www.googleapis.com/books/v1/volumes/{google_id}"
    if API_KEY:
        url += f"?key={API_KEY}"
        
    try:
        respuesta = requests.get(url, timeout=5)
        respuesta.raise_for_status()
        datos = respuesta.json()
        
        info = datos.get("volumeInfo", {})
        
        # Reutilizamos tu excelente hack para la portada
        url_portada = info.get("imageLinks", {}).get("thumbnail", "").replace("http:", "https:")
        if url_portada:
            url_portada = url_portada.replace("zoom=1", "zoom=3").replace("&edge=curl", "")
            
        return {
            "id": google_id, # Lo mandamos como 'id' para que React lo asimile igual que los locales
            "titulo": info.get("title", "Sin título"),
            "autor": info.get("authors", ["Autor desconocido"])[0] if info.get("authors") else "Autor desconocido",
            "sinopsis": info.get("description", "Sin sinopsis disponible en este momento."),
            "paginas": info.get("pageCount", 0),
            "url_portada": url_portada,
            "genero": info.get("categories", ["Sin género"])[0] if info.get("categories") else "Sin género",
            "origen": "Google Books"
        }
    except Exception as e:
        print(f"Error al obtener libro individual de Google Books: {e}")
        return None
