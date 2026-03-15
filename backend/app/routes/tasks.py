from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas import TaskCreate, TaskResponse, TaskUpdate
from app.crud import create_task, get_tasks, get_task, update_task
from app.dependencies import get_current_active_user
from app import models

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

@router.post("/", response_model=TaskResponse)
async def create_new_task(task: TaskCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return await create_task(db=db, task=task)

@router.get("/", response_model=List[TaskResponse])
async def read_tasks(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    tasks = await get_tasks(db, user_id=user_id, skip=skip, limit=limit)
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def read_task(task_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_task = await get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
async def modify_task(task_id: int, task_update: TaskUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_task = await get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return await update_task(db=db, db_task=db_task, task_update=task_update)
