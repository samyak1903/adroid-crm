from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from sqlalchemy.future import select
from sqlalchemy import update, delete
from app.models import Customer, Supplier, Enquiry, Order, User, Task, Goal, QualityClaim
from app.schemas import (CustomerCreate, SupplierCreate, EnquiryCreate, OrderCreate, UserCreate,
                         CustomerUpdate, SupplierUpdate, EnquiryUpdate, OrderUpdate,
                         TaskCreate, TaskUpdate, GoalCreate, GoalUpdate, QualityClaimCreate, QualityClaimUpdate)
from app import auth

# Users
async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_all_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()

async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    await db.commit()
    return db_user

async def update_user_password(db: AsyncSession, user: User, new_password: str):
    hashed_password = auth.get_password_hash(new_password)
    user.hashed_password = hashed_password
    await db.commit()
    await db.refresh(user)
    return user

# Customers
async def create_customer(db: AsyncSession, customer: CustomerCreate):
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

async def get_customers(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Customer).offset(skip).limit(limit))
    return result.scalars().all()

async def get_customer(db: AsyncSession, customer_id: int):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    return result.scalars().first()

async def update_customer(db: AsyncSession, db_customer: Customer, customer_update: CustomerUpdate):
    update_data = customer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

# Suppliers
async def create_supplier(db: AsyncSession, supplier: SupplierCreate):
    db_supplier = Supplier(**supplier.model_dump())
    db.add(db_supplier)
    await db.commit()
    await db.refresh(db_supplier)
    return db_supplier

async def get_suppliers(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Supplier).offset(skip).limit(limit))
    return result.scalars().all()

async def get_supplier(db: AsyncSession, supplier_id: int):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    return result.scalars().first()

async def update_supplier(db: AsyncSession, db_supplier: Supplier, supplier_update: SupplierUpdate):
    update_data = supplier_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)
    await db.commit()
    await db.refresh(db_supplier)
    return db_supplier

# Enquiries
async def create_enquiry(db: AsyncSession, enquiry: EnquiryCreate):
    db_enquiry = Enquiry(**enquiry.model_dump())
    db.add(db_enquiry)
    await db.commit()
    await db.refresh(db_enquiry)
    return db_enquiry

async def get_enquiries(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Enquiry).offset(skip).limit(limit))
    return result.scalars().all()

async def get_enquiry(db: AsyncSession, enquiry_id: int):
    result = await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))
    return result.scalars().first()

async def update_enquiry(db: AsyncSession, db_enquiry: Enquiry, enquiry_update: EnquiryUpdate):
    update_data = enquiry_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_enquiry, key, value)
    await db.commit()
    await db.refresh(db_enquiry)
    return db_enquiry

# Orders
async def create_order(db: AsyncSession, order: OrderCreate):
    db_order = Order(**order.model_dump())
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order

async def get_orders(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Order).offset(skip).limit(limit))
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int):
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalars().first()

async def update_order(db: AsyncSession, db_order: Order, order_update: OrderUpdate):
    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    await db.commit()
    await db.refresh(db_order)
    return db_order

# Tasks
async def create_task(db: AsyncSession, task: TaskCreate):
    db_task = Task(**task.model_dump())
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

async def get_tasks(db: AsyncSession, user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = select(Task)
    if user_id:
        query = query.where(Task.assigned_to == user_id)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

async def get_task(db: AsyncSession, task_id: int):
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalars().first()

async def update_task(db: AsyncSession, db_task: Task, task_update: TaskUpdate):
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    await db.commit()
    await db.refresh(db_task)
    return db_task

# Goals
async def create_goal(db: AsyncSession, goal: GoalCreate):
    db_goal = Goal(**goal.model_dump())
    db.add(db_goal)
    await db.commit()
    await db.refresh(db_goal)
    return db_goal

async def get_goals(db: AsyncSession, user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = select(Goal)
    if user_id:
        query = query.where(Goal.user_id == user_id)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

async def get_goal(db: AsyncSession, goal_id: int):
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    return result.scalars().first()

async def update_goal(db: AsyncSession, db_goal: Goal, goal_update: GoalUpdate):
    update_data = goal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
    await db.commit()
    await db.refresh(db_goal)
    return db_goal

# Quality Claims
async def create_quality_claim(db: AsyncSession, claim: QualityClaimCreate):
    db_claim = QualityClaim(**claim.model_dump())
    db.add(db_claim)
    await db.commit()
    await db.refresh(db_claim)
    return db_claim

async def get_quality_claims(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(QualityClaim).offset(skip).limit(limit))
    return result.scalars().all()

async def get_quality_claim(db: AsyncSession, claim_id: int):
    result = await db.execute(select(QualityClaim).where(QualityClaim.id == claim_id))
    return result.scalars().first()

async def update_quality_claim(db: AsyncSession, db_claim: QualityClaim, claim_update: QualityClaimUpdate):
    update_data = claim_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_claim, key, value)
    await db.commit()
    await db.refresh(db_claim)
    return db_claim
