import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

security_bearer = HTTPBearer()

def obtener_usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(security_bearer)):
    secret_key = os.getenv("JWT_SECRET")
    if not secret_key:
        raise HTTPException(status_code=500, detail="JWT_SECRET no está configurado")
    try:
        return jwt.decode(credenciales.credentials, secret_key, algorithms=["HS256"])
    except JWTError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado") from error

def requerir_admin(usuario_actual: dict = Depends(obtener_usuario_actual)):
    if usuario_actual.get("rol") not in {"admin", "administrador"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere rol de administrador")
    return usuario_actual
