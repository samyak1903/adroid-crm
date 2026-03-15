import asyncio
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.models import User, Customer, Supplier, Enquiry, Order, Task, Goal, QualityClaim, UserRole, LeadStage, Base
from passlib.context import CryptContext

engine = create_engine("sqlite:///./crm.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    db = SessionLocal()
    try:
        # Create Users
        print("Seeding Users...")
        admin = User(email="admin@adroit.com", hashed_password=get_password_hash("password"), full_name="Admin User", role=UserRole.ADMIN)
        employee1 = User(email="john@adroit.com", hashed_password=get_password_hash("password"), full_name="John Doe", role=UserRole.EMPLOYEE)
        employee2 = User(email="jane@adroit.com", hashed_password=get_password_hash("password"), full_name="Jane Smith", role=UserRole.EMPLOYEE)
        
        db.add_all([admin, employee1, employee2])
        db.commit()

        print("Seeding Customers...")
        cust1 = Customer(
            name="Acme Corp", type="End User", region="North America", country="USA", volume_potential="High",
            website="acme.com", products_used="Steel", pic_contacts="John Acme", email_addresses="john@acme.com",
            office_address="123 Acme St, NY", priority_rating=5, assigned_user="John Doe", lead_stage=LeadStage.QUALIFIED
        )
        cust2 = Customer(
            name="Global Traders", type="Trader", region="Europe", country="Germany", volume_potential="Medium",
            website="globaltraders.de", products_used="Aluminum", pic_contacts="Hans Muller", email_addresses="hans@globaltraders.de",
            office_address="Berlin, Germany", priority_rating=3, assigned_user="Jane Smith", lead_stage=LeadStage.INTRO_SENT
        )
        db.add_all([cust1, cust2])
        db.commit()

        print("Seeding Suppliers...")
        supp1 = Supplier(
            name="Steel Works Ltd", type="Mill", region="Asia", country="China", products="Steel Coils",
            pic_contacts="Li Wei", commission_rules="2%", reminder_frequency="Weekly"
        )
        supp2 = Supplier(
            name="AluTech Industries", type="Trader", region="Middle East", country="UAE", products="Aluminum Billets",
            pic_contacts="Ahmed Khan", commission_rules="1.5%", reminder_frequency="Monthly"
        )
        db.add_all([supp1, supp2])
        db.commit()

        print("Seeding Enquiries...")
        enq1 = Enquiry(
            enquiry_number="ENQ-2024-001", source="Email", customer_id=cust1.id, products_requested="Steel Coils 100MT",
            qty="100MT", status="Pending", notes="Urgent requirement"
        )
        enq2 = Enquiry(
            enquiry_number="ENQ-2024-002", source="Phone", customer_id=cust2.id, products_requested="Aluminum Billets 50MT",
            qty="50MT", status="Won", notes="Price negotiated"
        )
        db.add_all([enq1, enq2])
        db.commit()

        print("Seeding Orders...")
        ord1 = Order(
            sc_number="SC-2024-001", enquiry_id=enq2.id, supplier_id=supp2.id, qty="50MT", value_currency="$150,000",
            delivery_terms="CIF Hamburg", payment_mode="LC at Sight", shipment_status="Production", payment_status="Pending"
        )
        db.add(ord1)
        db.commit()

        print("Seeding Tasks...")
        task1 = Task(
            title="Follow up with Acme Corp", description="Call John regarding the new quote", assigned_to=employee1.id,
            due_date=datetime.utcnow(), status="Pending", type="Follow Up"
        )
        task2 = Task(
            title="Prepare sample for Global Traders", description="Send Aluminum samples to Hans", assigned_to=employee2.id,
            due_date=datetime.utcnow(), status="In Progress", type="Other"
        )
        db.add_all([task1, task2])
        db.commit()

        print("Seeding Goals...")
        goal1 = Goal(
            user_id=employee1.id, title="Generate Enquiries", target_value=50, current_value=12,
            deadline=datetime.utcnow(), status="Active"
        )
        goal2 = Goal(
            user_id=employee2.id, title="Close Deals", target_value=10, current_value=10,
            deadline=datetime.utcnow(), status="Achieved"
        )
        db.add_all([goal1, goal2])
        db.commit()

        print("Seeding Quality Claims...")
        claim1 = QualityClaim(
            order_id=ord1.id, customer_id=cust2.id, issue_description="5MT shortage on delivery", claim_amount=15000.0,
            status="Under Review"
        )
        db.add(claim1)
        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
