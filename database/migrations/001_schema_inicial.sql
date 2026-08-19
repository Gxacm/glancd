-- GLANCD: esquema canónico inicial para PostgreSQL/Supabase.
-- Ejecute este archivo una vez, en orden, sobre una base de datos vacía.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente'
        CHECK (rol IN ('cliente', 'admin', 'administrador')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    clave_google VARCHAR(100) NOT NULL UNIQUE,
    edad_minima INTEGER NOT NULL DEFAULT 0 CHECK (edad_minima >= 0),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuario_generos (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    genero_id INTEGER NOT NULL REFERENCES generos(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, genero_id)
);

CREATE TABLE IF NOT EXISTS autores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(200) NOT NULL UNIQUE,
    biografia TEXT,
    url_foto VARCHAR(500),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS libros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    sinopsis TEXT,
    url_portada VARCHAR(500),
    edad_objetivo INTEGER NOT NULL DEFAULT 0 CHECK (edad_objetivo >= 0),
    autor_id UUID NOT NULL REFERENCES autores(id) ON DELETE RESTRICT,
    genero_id INTEGER REFERENCES generos(id) ON DELETE SET NULL,
    google_id VARCHAR(255) UNIQUE,
    isbn VARCHAR(50) UNIQUE,
    cantidad_paginas INTEGER CHECK (cantidad_paginas IS NULL OR cantidad_paginas >= 0),
    fecha_publicacion VARCHAR(50),
    clasificacion_madurez VARCHAR(50),
    proveedor_origen VARCHAR(50),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS me_gusta_libros (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    libro_id UUID NOT NULL REFERENCES libros(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, libro_id)
);

-- Se crea desde el inicio para que ms-resenas pueda implementarse sin alterar el modelo.
CREATE TABLE IF NOT EXISTS resenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    libro_id UUID NOT NULL REFERENCES libros(id) ON DELETE CASCADE,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    contenido TEXT NOT NULL CHECK (char_length(trim(contenido)) BETWEEN 1 AND 5000),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, libro_id)
);

-- Compatibilidad mínima con tablas creadas antes de estas migraciones.
ALTER TABLE libros ADD COLUMN IF NOT EXISTS genero_id INTEGER;
ALTER TABLE libros ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_usuario_generos_genero ON usuario_generos(genero_id);
CREATE INDEX IF NOT EXISTS idx_libros_autor ON libros(autor_id);
CREATE INDEX IF NOT EXISTS idx_libros_genero ON libros(genero_id);
CREATE INDEX IF NOT EXISTS idx_me_gusta_libros_libro ON me_gusta_libros(libro_id);
CREATE INDEX IF NOT EXISTS idx_resenas_libro ON resenas(libro_id);
