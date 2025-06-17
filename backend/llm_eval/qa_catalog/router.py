from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from llm_eval.db import SessionDep
from llm_eval.qa_catalog.db.delete_qa_catalog import delete_qa_catalog
from llm_eval.qa_catalog.db.find_qa_catalog import find_qa_catalog
from llm_eval.qa_catalog.db.find_qa_catalog_by_group import (
    find_qa_catalog_with_latest_revision,
)
from llm_eval.qa_catalog.db.find_qa_catalog_preview import (
    find_qa_catalog_preview,
)
from llm_eval.qa_catalog.db.find_qa_catalog_previews import (
    find_qa_catalog_previews,
)
from llm_eval.qa_catalog.db.find_qa_pairs import find_qa_pairs
from llm_eval.qa_catalog.generator.implementation.QACatalogGeneratorTypes import (  # noqa: E501
    QACatalogGeneratorType,
    active_generator_types,
)
from llm_eval.qa_catalog.logic.create_qa_catalog import create_qa_catalog
from llm_eval.qa_catalog.logic.crud_qa_catalog_from_file import (
    create_qa_catalog_from_file,
    update_qa_catalog_from_file,
    update_qa_catalog_from_request,
)
from llm_eval.qa_catalog.logic.download import (
    handle_catalog_download,
)
from llm_eval.qa_catalog.logic.revision_history import (
    create_qa_catalog_revision_history,
)
from llm_eval.qa_catalog.models import (
    ActiveQACatalogGeneratorType,
    DeleteCatalogResult,
    DownloadQACatalogOptions,
    DownloadQACatalogResponse,
    QACatalog,
    QACatalogGenerationData,
    QACatalogGenerationResult,
    QACatalogPreview,
    QACatalogUpdateRequest,
    QACatalogVersionHistory,
    QAPair,
)
from llm_eval.qa_catalog.tasks.handle_generate_catalog_task import (
    submit_generate_catalog_task,
)
from llm_eval.schemas import GenericError
from llm_eval.utils.api import PaginationParamsDep

router = APIRouter(prefix="/qa-catalog", tags=["qa-catalog"])


@router.get("")
async def get_all(
    db: SessionDep,
    pagination_params: PaginationParamsDep,
    name: str | None = None,
) -> list[QACatalogPreview]:
    return await find_qa_catalog_previews(
        db, pagination_params.limit, pagination_params.offset, name
    )


@router.post("/upload", status_code=201)
async def upload(
    db: SessionDep,
    file: Annotated[UploadFile, File()],
    name: Annotated[str, Form()],
) -> QACatalog:
    try:
        catalog = await create_qa_catalog_from_file(db, file, name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return QACatalog.from_db_model(catalog)


@router.put("/{catalog_id}/upload", status_code=201)
async def update(
    db: SessionDep,
    file: Annotated[UploadFile, File()],
    catalog_id: str,
) -> QACatalog:
    prev_catalog = await find_qa_catalog(db, catalog_id)
    if prev_catalog is None:
        raise HTTPException(
            status_code=404, detail="Catalog not found, cannot update it"
        )
    try:
        catalog = await update_qa_catalog_from_file(db, file, prev_catalog)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return QACatalog.from_db_model(catalog)


@router.get("/{catalog_id}", responses={404: {"model": GenericError}})
async def get(
    db: SessionDep,
    catalog_id: str,
) -> QACatalog:
    catalog = await find_qa_catalog(db, catalog_id)

    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found.")

    return QACatalog.from_db_model(catalog)


@router.patch("/{catalog_id}", response_model=QACatalog)
async def edit_qa_catalog(
    db: SessionDep, catalog_id: str, update_data: QACatalogUpdateRequest
) -> QACatalog:
    catalog = await find_qa_catalog(db, catalog_id)
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")

    return QACatalog.from_db_model(
        await update_qa_catalog_from_request(db, update_data, catalog)
    )


@router.get("/{catalog_id}/preview")
async def get_preview(db: SessionDep, catalog_id: str) -> QACatalogPreview:
    catalog = await find_qa_catalog_preview(db, catalog_id)

    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found.")

    return catalog


@router.delete("/{catalog_id}", responses={404: {"model": GenericError}})
async def delete(
    db: SessionDep,
    catalog_id: str,
) -> DeleteCatalogResult:
    catalog = await find_qa_catalog(db, catalog_id)

    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found.")

    await delete_qa_catalog(db, catalog)

    latest_catalog = await find_qa_catalog_with_latest_revision(
        db, catalog.qa_catalog_group_id
    )

    if latest_catalog:
        previous_id = latest_catalog.id
    else:
        previous_id = None

    return DeleteCatalogResult(previous_revision_id=previous_id)


@router.get("/{catalog_id}/qa-pairs")
async def get_catalog_qa_pairs(
    db: SessionDep,
    catalog_id: str,
    pagination_params: PaginationParamsDep,
) -> list[QAPair]:
    qa_pairs = await find_qa_pairs(
        db,
        catalog_id,
        pagination_params.limit,
        pagination_params.offset,
    )

    return [QAPair.model_validate(qa_pair) for qa_pair in qa_pairs]


@router.post("/generator/upload")
async def create_data_source_config(
    db: SessionDep,
    generator_type: Annotated[QACatalogGeneratorType, Form()],
    files: Annotated[list[UploadFile], File(...)],
) -> str:
    from llm_eval.qa_catalog.logic.upload import (
        create_qa_catalog_data_source_config,
    )

    return await create_qa_catalog_data_source_config(db, files, generator_type)


@router.post(
    "/generator/catalog",
    description="Start a new qa catalog generation",
    status_code=201,
)
async def generate(
    db: SessionDep,
    data: QACatalogGenerationData,
) -> QACatalogGenerationResult:
    qa_catalog = await create_qa_catalog(db, [], data.name)

    submit_generate_catalog_task(qa_catalog.id, data)

    return QACatalogGenerationResult(catalog_id=qa_catalog.id)


@router.get(
    "/generator/types",
    description="Currently active generator types to select from for catalog creation",
    status_code=200,
)
async def get_generator_types() -> list[ActiveQACatalogGeneratorType]:
    return [
        ActiveQACatalogGeneratorType(type=generator_type)  # type: ignore
        for generator_type in active_generator_types
    ]


@router.post("/download")
async def download(
    db: SessionDep,
    options: DownloadQACatalogOptions,
) -> DownloadQACatalogResponse:
    result = await handle_catalog_download(db, options)
    if not result:
        raise HTTPException(status_code=404, detail="Catalog not found")

    return result


@router.get("/{catalog_id}/history")
async def get_history(db: SessionDep, catalog_id: str) -> QACatalogVersionHistory:
    catalog = await find_qa_catalog(db, catalog_id)
    if not catalog:
        raise HTTPException(status_code=404)

    res = await create_qa_catalog_revision_history(db, catalog)
    return res
