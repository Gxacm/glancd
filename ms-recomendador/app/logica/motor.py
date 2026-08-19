from sqlalchemy import create_engine, text
from app.nucleo.configuracion import DATABASE_URL
from app.servicios_externos.clientes_http import buscar_por_genero

def obtener_recomendaciones(usuario_id: str) -> list[dict]:
    if not DATABASE_URL:
        raise RuntimeError('DATABASE_URL no está configurado')
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conexion:
        generos = conexion.execute(text('''
            SELECT g.nombre, g.clave_google
            FROM usuario_generos ug
            JOIN generos g ON g.id = ug.genero_id
            WHERE ug.usuario_id = :usuario_id
            ORDER BY g.nombre
        '''), {'usuario_id': usuario_id}).mappings().all()
    secciones = []
    for genero in generos:
        try:
            libros = buscar_por_genero(genero['clave_google'])
        except Exception:
            libros = []
        secciones.append({'genero': genero['nombre'], 'clave_google': genero['clave_google'], 'libros': libros})
    return secciones
