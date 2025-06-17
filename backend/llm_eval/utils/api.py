from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic.dataclasses import dataclass

from llm_eval.auth.validate_token import validate_token
from llm_eval.auth.user_principal import UserPrincipal


@dataclass
class PaginationParams:
    offset: int = 0
    limit: int = 50


PaginationParamsDep = Annotated[PaginationParams, Depends()]


async def get_user_principal(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())],
) -> UserPrincipal:
    decoded_token = await validate_token(credentials.credentials)

    sub = decoded_token["sub"]
    preferred_username = decoded_token["preferred_username"]
    email = decoded_token.get("email", None)

    return UserPrincipal(
        id=sub,
        name=preferred_username,
        email=email,
    )


UserPrincipalDep = Annotated[UserPrincipal, Depends(get_user_principal)]
