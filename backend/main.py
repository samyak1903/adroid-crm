from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import customers, suppliers, enquiries, orders, auth, tasks, goals, claims

app = FastAPI(title="Adroit CRM API")

app.include_router(customers.router)
app.include_router(suppliers.router)
app.include_router(enquiries.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(goals.router)
app.include_router(claims.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Adroit CRM API Backend"}
