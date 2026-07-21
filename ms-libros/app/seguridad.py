# app/seguridad.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

# ⚠️ DEBE SER EXACTAMENTE LA MISMA CLAVE SECRETA USADA EN NODE.JS (ms-usuarios)
SECRET_KEY = "Mi_Clave_Secreta_Super_Segura_123"  # Cambia esto por tu JWT_SECRET real de Node
ALGORITHM = "HS256"

# Esquema Bearer para que Swagger Docs y FastAPI lean el header Authorization
security_bearer = HTTPBearer()

def obtener_usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(security_bearer)):
    token = credenciales.credentials
    
    exception_unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificamos y verificamos la firma del token generado por Node.js
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Opcional: Extraer el ID o email del payload
        usuario_id: str = payload.get("id") or payload.get("sub")
        
        if usuario_id is None:
            raise exception_unauthorized
            
        return payload  # Retorna el usuario decodificado
        
    except JWTError:
        raise exception_unauthorized