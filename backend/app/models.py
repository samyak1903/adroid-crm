from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    EMPLOYEE = "Employee"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.MANAGER)

class LeadStage(str, enum.Enum):
    ALL = "All"
    SELECTED = "Selected"
    INTRO_SENT = "Intro Sent"
    PM_CONNECTED = "PM Connected"
    QUALIFIED = "Qualified"

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # End user/trader/stockist
    region = Column(String)
    country = Column(String)
    volume_potential = Column(String)
    website = Column(String)
    products_used = Column(Text)
    pic_contacts = Column(Text)  # JSON or comma separated
    email_addresses = Column(Text)
    office_address = Column(Text)
    priority_rating = Column(Integer, default=0) # 0 to 5
    assigned_user = Column(String)
    lead_stage = Column(Enum(LeadStage), default=LeadStage.ALL)
    
    enquiries = relationship("Enquiry", back_populates="customer")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # Mill/trader/AGENT
    region = Column(String)
    country = Column(String)
    products = Column(Text)
    pic_contacts = Column(Text)
    commission_rules = Column(String)
    reminder_frequency = Column(String)

class Enquiry(Base):
    __tablename__ = "enquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    enquiry_number = Column(String, unique=True, index=True)
    source = Column(String) # Phone/Whatsapp/Mail
    date = Column(DateTime, default=datetime.utcnow)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    products_requested = Column(Text)
    qty = Column(String)
    status = Column(String, default="Pending") # Pending/Won/Lost
    notes = Column(Text)
    
    customer = relationship("Customer", back_populates="enquiries")
    orders = relationship("Order", back_populates="enquiry")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    sc_number = Column(String, unique=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    qty = Column(String)
    value_currency = Column(String)
    delivery_terms = Column(String)
    payment_mode = Column(String)
    shipment_status = Column(String)
    payment_status = Column(String)
    
    enquiry = relationship("Enquiry", back_populates="orders")
    supplier = relationship("Supplier")

class ActivityFile(Base):
    __tablename__ = "activity_files"
    
    id = Column(Integer, primary_key=True, index=True)
    reference_type = Column(String) # Enquiry, Order, Customer, Supplier
    reference_id = Column(Integer)
    file_name = Column(String)
    r2_url = Column(String)

class ManagerActivity(Base):
    __tablename__ = "manager_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    type = Column(String) # Visit, Call, Note, Goal
    date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    assigned_to = Column(Integer, ForeignKey("users.id")) # Assuming user ID
    due_date = Column(DateTime)
    status = Column(String, default="Pending") # Pending, In Progress, Completed
    type = Column(String) # Cold Call, Follow Up, Enquiry Response
    created_at = Column(DateTime, default=datetime.utcnow)

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    target_value = Column(Float)
    current_value = Column(Float, default=0.0)
    deadline = Column(DateTime)
    status = Column(String, default="Active")

class QualityClaim(Base):
    __tablename__ = "quality_claims"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    issue_description = Column(Text)
    claim_amount = Column(Float)
    status = Column(String, default="Open") # Open, Under Review, Resolved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)
