from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import SupplierCreate, SupplierResponse, SupplierUpdate
from app.crud import create_supplier, get_suppliers, get_supplier, update_supplier
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"]
)

@router.post("/", response_model=SupplierResponse)
async def create_new_supplier(supplier: SupplierCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_supplier(db=db, supplier=supplier)

@router.get("/", response_model=List[SupplierResponse])
async def read_suppliers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    suppliers = await get_suppliers(db, skip=skip, limit=limit)
    return suppliers

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def read_supplier(supplier_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_supplier = await get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def modify_supplier(supplier_id: int, supplier_update: SupplierUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_supplier = await get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return await update_supplier(db=db, db_supplier=db_supplier, supplier_update=supplier_update)
