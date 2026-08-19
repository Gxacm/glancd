# Puesta en marcha

1. Crea cada archivo `.env` desde su `.env.example`. Conserva el `DATABASE_URL`
   correcto para todos los servicios y usa exactamente el mismo `JWT_SECRET` en
   Usuarios, Libros, Autores, Interacciones, Reseñas y Recomendador.
2. Ejecuta en orden los archivos de `database/migrations/`: `001_schema_inicial.sql`,
   `002_actualizar_esquema_existente.sql` y `003_endurecer_restricciones.sql`.
   Son idempotentes y preservan los datos existentes.
3. Para desarrollo local, las direcciones del frontend son las incluidas en
   `frontend/.env.example`. Dentro de Docker, Libros resuelve Autores mediante
   `MS_AUTORES_URL=http://ms-autores:8002`.
4. Levanta los servicios con `docker compose up --build`.
5. Comprueba los endpoints `/health` de los puertos 3001, 8001, 8002, 8003,
   8004 y 8005. El frontend queda en el puerto 3000.

## Administrador inicial

El registro público crea cuentas con el rol `cliente`. Promueve una cuenta ya
registrada desde PostgreSQL para acceder al panel administrativo:

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@tu-dominio.com';
```

No subas archivos `.env`: contienen credenciales. Los archivos `.env.example`
son los únicos que se versionan.
