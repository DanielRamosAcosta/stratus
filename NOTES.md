Para obtener el **breadcrumb** (la ruta completa desde la raíz hasta un directorio concreto) en PostgreSQL, cuando tienes una estructura jerárquica modelada con un campo `parentId`, puedes usar una **consulta recursiva con `WITH RECURSIVE`**.

En tu caso, como el directorio con `id = 4` es "imágenes", que tiene como padre a `id = 2` ("dani"), que a su vez cuelga de `id = 1` ("root"), puedes hacer algo así:

```sql
WITH RECURSIVE breadcrumb AS (
  SELECT id, name, parentId
  FROM directories
  WHERE id = 4  -- punto de partida

  UNION ALL

  SELECT d.id, d.name, d.parentId
  FROM directories d
  INNER JOIN breadcrumb b ON d.id = b.parentId
  WHERE d.id != d.parentId  -- para evitar bucle infinito en la raíz
)
SELECT name
FROM breadcrumb
ORDER BY id;  -- o usa otra estrategia para el orden
```

### Para ordenar correctamente desde la raíz hasta el directorio:

Podrías incluir una columna extra de "profundidad" y ordenar por ella:

```sql
WITH RECURSIVE breadcrumb AS (
  SELECT id, name, parentId, 1 AS depth
  FROM directories
  WHERE id = 4

  UNION ALL

  SELECT d.id, d.name, d.parentId, b.depth + 1
  FROM directories d
  INNER JOIN breadcrumb b ON d.id = b.parentId
  WHERE d.id != d.parentId
)
SELECT name
FROM breadcrumb
ORDER BY depth DESC;  -- orden desde la raíz hasta el nodo actual
```

### Resultado esperado:

```
root
dani
imagenes
```

¿Quieres que te lo devuelva como un string tipo `"root > dani > imagenes"`? Si es así, puedes añadir esto al final:

```sql
SELECT string_agg(name, ' > ' ORDER BY depth DESC) AS breadcrumb
FROM breadcrumb;
```

Let me know si el campo se llama distinto o si estás usando `snake_case`, y lo adaptamos.
