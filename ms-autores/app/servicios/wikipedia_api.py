# app/servicios/wikipedia_api.py
import requests
import urllib.parse

def obtener_info_autor_wikipedia(nombre_autor: str) -> dict:
    """
    Busca el resumen y la foto de un autor en la API REST de Wikipedia en español.
    Retorna un diccionario con 'biografia' y 'url_foto'.
    """
    # 1. Formatear el nombre (Wikipedia requiere guiones bajos en lugar de espacios)
    # Usamos urllib.parse.quote para manejar correctamente tildes (ej. García Márquez)
    nombre_formateado = urllib.parse.quote(nombre_autor.replace(" ", "_"))
    url = f"https://es.wikipedia.org/api/rest_v1/page/summary/{nombre_formateado}"
    
    # 2. Definir valores por defecto (Fallback) en caso de que el autor no exista en Wikipedia
    resultado = {
        "biografia": "EMPTY",
        "url_foto": "EMPTY"
    }
    
    try:
        # Wikipedia pide amablemente que incluyamos un User-Agent identificando nuestra app
        headers = {
            'User-Agent': 'BibliotecaVirtualApp/1.0 (backend_microservicios)' 
        }
        
        respuesta = requests.get(url, headers=headers, timeout=5)
        
        # Si la petición es exitosa (200 OK)
        if respuesta.status_code == 200:
            datos = respuesta.json()
            
            # Extraer biografía (el campo 'extract' trae texto plano limpio)
            if "extract" in datos:
                resultado["biografia"] = datos["extract"]
            
            # Extraer foto (priorizamos originalimage para mejor calidad)
            if "originalimage" in datos and "source" in datos["originalimage"]:
                resultado["url_foto"] = datos["originalimage"]["source"]
            elif "thumbnail" in datos and "source" in datos["thumbnail"]:
                resultado["url_foto"] = datos["thumbnail"]["source"]
                
    except Exception as e:
        print(f"⚠️ Error al consultar Wikipedia para {nombre_autor}: {e}")
        
    return resultado