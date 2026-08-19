-- Compatibilidad con la base de datos creada antes de 001_schema_inicial.sql.
-- No elimina tablas ni datos existentes.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE autores ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE libros ADD COLUMN IF NOT EXISTS genero_id INTEGER;
ALTER TABLE libros ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'resenas' AND column_name = 'comentario'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'resenas' AND column_name = 'contenido'
    ) THEN
        ALTER TABLE resenas RENAME COLUMN comentario TO contenido;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'libros_genero_id_fkey'
    ) THEN
        ALTER TABLE libros
            ADD CONSTRAINT libros_genero_id_fkey
            FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_libros_genero ON libros(genero_id);
CREATE INDEX IF NOT EXISTS idx_resenas_libro ON resenas(libro_id);
