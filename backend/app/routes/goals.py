from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas import GoalCreate, GoalResponse, GoalUpdate
from app.crud import create_goal, get_goals, get_goal, update_goal
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/goals",
    tags=["goals"]
)

@router.post("/", response_model=GoalResponse)
async def create_new_goal(goal: GoalCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_goal(db=db, goal=goal)

@router.get("/", response_model=List[GoalResponse])
async def read_goals(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    goals = await get_goals(db, user_id=user_id, skip=skip, limit=limit)
    return goals

@router.get("/{goal_id}", response_model=GoalResponse)
async def read_goal(goal_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_goal = await get_goal(db, goal_id=goal_id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@router.put("/{goal_id}", response_model=GoalResponse)
async def modify_goal(goal_id: int, goal_update: GoalUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_goal = await get_goal(db, goal_id=goal_id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return await update_goal(db=db, db_goal=db_goal, goal_update=goal_update)
