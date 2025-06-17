from contextlib import asynccontextmanager
from os import environ
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, FastAPI, Response, status
from fastapi.routing import APIRoute

from llm_eval.database.migration import run_migrations_async
from llm_eval.dashboard.router import router as dashboard_router
from llm_eval.db import engine
from llm_eval.eval.router import router as eval_router
from llm_eval.exception_handlers import unhandled_exception_handler
from llm_eval.llm_endpoints.router import router as llm_endpoints_router
from llm_eval.metrics.router import router as metric_router
from llm_eval.qa_catalog.router import router as qa_catalog_router
from llm_eval.utils.api import get_user_principal
from llm_eval.utils.data_dir import setup_data_dir
from llm_eval.utils.ssl import setup_custom_ssl_cert
from llm_eval.utils.env import load_env

load_env()

setup_data_dir()
setup_custom_ssl_cert()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    await run_migrations_async(engine)
    yield


app = FastAPI(lifespan=lifespan)
app.add_exception_handler(Exception, unhandled_exception_handler)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["healthcheck"])
def health() -> Response:
    return Response(environ.get("APP_VERSION"))


secure_router = APIRouter(prefix="", dependencies=[Depends(get_user_principal)])
secure_router.include_router(eval_router, prefix="/v1")
secure_router.include_router(dashboard_router, prefix="/v1")
secure_router.include_router(qa_catalog_router, prefix="/v1")
secure_router.include_router(llm_endpoints_router, prefix="/v1")
secure_router.include_router(metric_router, prefix="/v1")

app.include_router(secure_router)


# noinspection PyShadowingNames
def build_operation_ids(app: FastAPI) -> None:
    for route in app.routes:
        if isinstance(route, APIRoute):
            route.operation_id = f"{'_'.join(route.tags)}_{route.name}"


build_operation_ids(app)
