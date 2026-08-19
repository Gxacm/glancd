-- Las URLs de Google Books pueden incluir tokens largos (imgtk/source).
ALTER TABLE libros ALTER COLUMN url_portada TYPE TEXT;
ALTER TABLE autores ALTER COLUMN url_foto TYPE TEXT;
