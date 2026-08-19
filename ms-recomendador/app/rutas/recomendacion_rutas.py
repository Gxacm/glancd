import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.logica.motor import obtener_recomendaciones

router = APIRouter(prefix='/api/recomendaciones', tags=['Recomendaciones'])
security = HTTPBearer()

def usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    secret = os.getenv('JWT_SECRET')
    if not secret:
        raise HTTPException(status_code=500, detail='JWT_SECRET no está configurado')
    try:
        payload = jwt.decode(credenciales.credentials, secret, algorithms=['HS256'])
        if not payload.get('id'):
            raise JWTError('JWT sin identificador de usuario')
        return payload
    except JWTError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token inválido o expirado') from error

@router.get('/')
def recomendaciones(usuario: dict = Depends(usuario_actual)):
    try:
        return obtener_recomendaciones(usuario['id'])
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
