from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import QualityClaimCreate, QualityClaimResponse, QualityClaimUpdate
from app.crud import create_quality_claim, get_quality_claims, get_quality_claim, update_quality_claim
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/claims",
    tags=["claims"]
)

@router.post("/", response_model=QualityClaimResponse)
async def create_new_claim(claim: QualityClaimCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_quality_claim(db=db, claim=claim)

@router.get("/", response_model=List[QualityClaimResponse])
async def read_claims(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    claims = await get_quality_claims(db, skip=skip, limit=limit)
    return claims

@router.get("/{claim_id}", response_model=QualityClaimResponse)
async def read_claim(claim_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_claim = await get_quality_claim(db, claim_id=claim_id)
    if db_claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    return db_claim

@router.put("/{claim_id}", response_model=QualityClaimResponse)
async def modify_claim(claim_id: int, claim_update: QualityClaimUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_claim = await get_quality_claim(db, claim_id=claim_id)
    if db_claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    return await update_quality_claim(db=db, db_claim=db_claim, claim_update=claim_update)
