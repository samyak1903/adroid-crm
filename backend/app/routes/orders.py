from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import OrderCreate, OrderResponse, OrderUpdate
from app.crud import create_order, get_orders, get_order, update_order
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=OrderResponse)
async def create_new_order(order: OrderCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_order(db=db, order=order)

@router.get("/", response_model=List[OrderResponse])
async def read_orders(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    orders = await get_orders(db, skip=skip, limit=limit)
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def read_order(order_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_order = await get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.put("/{order_id}", response_model=OrderResponse)
async def modify_order(order_id: int, order_update: OrderUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_order = await get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return await update_order(db=db, db_order=db_order, order_update=order_update)
