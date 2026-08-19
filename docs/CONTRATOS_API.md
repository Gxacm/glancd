# Contratos de integración de GLANCD

Este documento define la fuente de verdad de las entidades compartidas. Todos los
servicios usan PostgreSQL como persistencia temporal, pero cada ruta tiene un único
responsable para evitar APIs duplicadas.

## Entidades

- `Usuario`: `id`, `nombre`, `apellido`, `email`, `rol`.
- `Genero`: `id`, `nombre`, `clave_google`, `edad_minima`.
- `Autor`: `id`, `nombre_completo`, `biografia`, `url_foto`.
- `Libro`: `id`, `titulo`, `sinopsis`, `url_portada`, `edad_objetivo`, `autor_id`,
  `genero_id`, `google_id`, `isbn`, `cantidad_paginas`, `fecha_publicacion`,
  `clasificacion_madurez`, `proveedor_origen`.

## Responsables y rutas

| Servicio | Rutas públicas | Rutas autenticadas |
| --- | --- | --- |
| Usuarios | `POST /api/usuarios/registrar`, `POST /api/usuarios/login`, `GET /api/generos` | `POST /api/generos/usuario/:id`, `GET /api/usuarios/perfil` |
| Autores | `GET /api/autores`, `GET /api/autores/:id` | `POST`, `PUT /:id`, `DELETE /:id` |
| Libros | `GET /api/libros/buscar`, `GET /api/libros/:id`, `GET /api/generos/` | CRUD de libros y administración de géneros |
| Interacciones | — | estado, toggle y biblioteca del usuario autenticado |
| Reseñas | `GET /api/resenas/libros/:libroId` | `GET /api/resenas/mias`; crear, editar y borrar la reseña propia |
| Recomendador | — | `GET /api/recomendaciones/` del usuario autenticado |

## Libro: solicitud y respuesta

Para crear o actualizar, se debe enviar **uno** de `autor_id` o `nombre_autor`.
`autor_id` se utiliza en el panel administrativo; `nombre_autor` permite guardar un
resultado externo. `genero_id` es opcional.

```json
{
  "titulo": "Dune",
  "sinopsis": "...",
  "url_portada": "https://...",
  "autor_id": "uuid-opcional",
  "nombre_autor": "Solo si no hay autor_id",
  "genero_id": 1,
  "google_id": "..."
}
```

La respuesta incluye siempre `autor_id`, `genero_id`, `autor` y `genero` cuando
existan. Los clientes no deben asumir que los datos de Google Books usan el mismo
identificador que un libro guardado: el `id` externo se transforma en un UUID al
guardarlo.

## Seguridad

El cliente envía `Authorization: Bearer <JWT>` en toda ruta autenticada. El ID del
usuario se toma exclusivamente del JWT; nunca del cuerpo ni de parámetros recibidos.
