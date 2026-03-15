from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import LeadStage, UserRole

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.MANAGER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    type: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    volume_potential: Optional[str] = None
    website: Optional[str] = None
    products_used: Optional[str] = None
    pic_contacts: Optional[str] = None
    email_addresses: Optional[str] = None
    office_address: Optional[str] = None
    priority_rating: int = 0
    assigned_user: Optional[str] = None
    lead_stage: LeadStage = LeadStage.ALL

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    volume_potential: Optional[str] = None
    website: Optional[str] = None
    products_used: Optional[str] = None
    pic_contacts: Optional[str] = None
    email_addresses: Optional[str] = None
    office_address: Optional[str] = None
    priority_rating: Optional[int] = None
    assigned_user: Optional[str] = None
    lead_stage: Optional[LeadStage] = None

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    type: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    products: Optional[str] = None
    pic_contacts: Optional[str] = None
    commission_rules: Optional[str] = None
    reminder_frequency: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    products: Optional[str] = None
    pic_contacts: Optional[str] = None
    commission_rules: Optional[str] = None
    reminder_frequency: Optional[str] = None

class SupplierResponse(SupplierBase):
    id: int
    
    class Config:
        from_attributes = True

class EnquiryBase(BaseModel):
    enquiry_number: str
    source: Optional[str] = None
    customer_id: int
    products_requested: Optional[str] = None
    qty: Optional[str] = None
    status: str = "Pending"
    notes: Optional[str] = None

class EnquiryCreate(EnquiryBase):
    pass

class EnquiryUpdate(BaseModel):
    enquiry_number: Optional[str] = None
    source: Optional[str] = None
    customer_id: Optional[int] = None
    products_requested: Optional[str] = None
    qty: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class EnquiryResponse(EnquiryBase):
    id: int
    date: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    sc_number: str
    enquiry_id: int
    supplier_id: int
    qty: Optional[str] = None
    value_currency: Optional[str] = None
    delivery_terms: Optional[str] = None
    payment_mode: Optional[str] = None
    shipment_status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    sc_number: Optional[str] = None
    enquiry_id: Optional[int] = None
    supplier_id: Optional[int] = None
    qty: Optional[str] = None
    value_currency: Optional[str] = None
    delivery_terms: Optional[str] = None
    payment_mode: Optional[str] = None
    shipment_status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: str = "Pending"
    type: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    type: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Goal Schemas
class GoalBase(BaseModel):
    user_id: int
    title: str
    target_value: float
    current_value: float = 0.0
    deadline: Optional[datetime] = None
    status: str = "Active"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    
    class Config:
        from_attributes = True

# Quality Claim Schemas
class QualityClaimBase(BaseModel):
    order_id: int
    customer_id: int
    issue_description: str
    claim_amount: float
    status: str = "Open"

class QualityClaimCreate(QualityClaimBase):
    pass

class QualityClaimUpdate(BaseModel):
    issue_description: Optional[str] = None
    claim_amount: Optional[float] = None
    status: Optional[str] = None

class QualityClaimResponse(QualityClaimBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
