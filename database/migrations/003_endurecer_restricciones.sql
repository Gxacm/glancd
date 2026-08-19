-- Reglas de integridad que faltaban en la base de datos preexistente.

DO $$
DECLARE
    fk RECORD;
BEGIN
    FOR fk IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'libros'::regclass
          AND confrelid = 'autores'::regclass
          AND contype = 'f'
    LOOP
        EXECUTE format('ALTER TABLE libros DROP CONSTRAINT %I', fk.conname);
    END LOOP;
END $$;

ALTER TABLE libros
    ADD CONSTRAINT libros_autor_id_fkey
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE RESTRICT;

-- No se fuerza ISBN único sobre instalaciones históricas: pueden contener
-- duplicados legítimos por edición/formato. El identificador estable es `id`
-- y, para importaciones externas, `google_id`.
CREATE INDEX IF NOT EXISTS idx_libros_isbn ON libros(isbn);

ALTER TABLE resenas
    ADD CONSTRAINT resenas_usuario_libro_key UNIQUE (usuario_id, libro_id);

ALTER TABLE resenas
    DROP CONSTRAINT IF EXISTS resenas_calificacion_check;

ALTER TABLE resenas
    ADD CONSTRAINT resenas_calificacion_check CHECK (calificacion BETWEEN 1 AND 5);
