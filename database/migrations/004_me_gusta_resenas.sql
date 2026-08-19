-- Reacciones a reseñas: una reacción por usuario y reseña.
CREATE TABLE IF NOT EXISTS me_gusta_resenas (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    resena_id UUID NOT NULL REFERENCES resenas(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, resena_id)
);

CREATE INDEX IF NOT EXISTS idx_me_gusta_resenas_resena ON me_gusta_resenas(resena_id);
