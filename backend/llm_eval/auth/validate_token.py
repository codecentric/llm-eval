from typing import Any

import jwt
from loguru import logger

from llm_eval.responses import unauthorized
from llm_eval.settings import SETTINGS

jwks_client = jwt.PyJWKClient(SETTINGS.auth.jwks_uri)


async def validate_token(token: str) -> dict[str, Any]:
    try:
        decoded_token = jwt.decode(
            token,
            jwks_client.get_signing_key_from_jwt(token),
            algorithms=SETTINGS.auth.algorithms,
            options={"verify_aud": False},
        )

        return decoded_token
    except Exception as e:
        logger.opt(exception=e).warning("Invalid token.")
        raise unauthorized()
