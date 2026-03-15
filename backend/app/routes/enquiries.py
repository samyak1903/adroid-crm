from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import EnquiryCreate, EnquiryResponse, EnquiryUpdate
from app.crud import create_enquiry, get_enquiries, get_enquiry, update_enquiry
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/enquiries",
    tags=["enquiries"]
)

@router.post("/", response_model=EnquiryResponse)
async def create_new_enquiry(enquiry: EnquiryCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_enquiry(db=db, enquiry=enquiry)

@router.get("/", response_model=List[EnquiryResponse])
async def read_enquiries(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    enquiries = await get_enquiries(db, skip=skip, limit=limit)
    return enquiries

@router.get("/{enquiry_id}", response_model=EnquiryResponse)
async def read_enquiry(enquiry_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_enquiry = await get_enquiry(db, enquiry_id=enquiry_id)
    if db_enquiry is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return db_enquiry

@router.put("/{enquiry_id}", response_model=EnquiryResponse)
async def modify_enquiry(enquiry_id: int, enquiry_update: EnquiryUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_enquiry = await get_enquiry(db, enquiry_id=enquiry_id)
    if db_enquiry is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return await update_enquiry(db=db, db_enquiry=db_enquiry, enquiry_update=enquiry_update)
