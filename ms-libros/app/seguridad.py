# app/seguridad.py
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

ALGORITHM = "HS256"

# Esquema Bearer para que Swagger Docs y FastAPI lean el header Authorization
security_bearer = HTTPBearer()

def obtener_usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(security_bearer)):
    token = credenciales.credentials
    secret_key = os.getenv("JWT_SECRET")
    
    exception_unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        if not secret_key:
            raise RuntimeError("JWT_SECRET no está configurado")
        # Decodificamos y verificamos la firma del token generado por Node.js
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        
        # Opcional: Extraer el ID o email del payload
        usuario_id: str = payload.get("id") or payload.get("sub")
        
        if usuario_id is None:
            raise exception_unauthorized
            
        return payload  # Retorna el usuario decodificado
        
    except JWTError:
        raise exception_unauthorized

def requerir_admin(usuario_actual: dict = Depends(obtener_usuario_actual)):
    if usuario_actual.get("rol") not in {"admin", "administrador"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere rol de administrador")
    return usuario_actual
