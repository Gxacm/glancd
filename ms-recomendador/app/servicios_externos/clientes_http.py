import requests
from app.nucleo.configuracion import GOOGLE_BOOKS_API_KEY

def buscar_por_genero(clave_google: str, limite: int = 10) -> list[dict]:
    params = {'q': f'subject:{clave_google}', 'maxResults': limite}
    if GOOGLE_BOOKS_API_KEY:
        params['key'] = GOOGLE_BOOKS_API_KEY
    respuesta = requests.get('https://www.googleapis.com/books/v1/volumes', params=params, timeout=5)
    respuesta.raise_for_status()
    resultados = []
    for item in respuesta.json().get('items', []):
        info = item.get('volumeInfo', {})
        portada = info.get('imageLinks', {}).get('thumbnail', '').replace('http:', 'https:')
        resultados.append({
            'id': item.get('id'),
            'google_id': item.get('id'),
            'titulo': info.get('title', 'Sin título'),
            'nombre_autor': (info.get('authors') or ['Autor desconocido'])[0],
            'sinopsis': info.get('description', ''),
            'url_portada': portada,
            'cantidad_paginas': info.get('pageCount', 0),
            'origen': 'Google Books',
        })
    return resultados
