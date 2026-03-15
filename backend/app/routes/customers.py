from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import CustomerCreate, CustomerResponse, CustomerUpdate
from app.crud import create_customer, get_customers, get_customer, update_customer
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
)

@router.post("/", response_model=CustomerResponse)
async def create_new_customer(customer: CustomerCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_customer(db=db, customer=customer)

@router.get("/", response_model=List[CustomerResponse])
async def read_customers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    customers = await get_customers(db, skip=skip, limit=limit)
    return customers

@router.get("/{customer_id}", response_model=CustomerResponse)
async def read_customer(customer_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_customer = await get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def modify_customer(customer_id: int, customer_update: CustomerUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_customer = await get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return await update_customer(db=db, db_customer=db_customer, customer_update=customer_update)
