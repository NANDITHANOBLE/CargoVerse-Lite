from pydantic import BaseModel, EmailStr

class TraderRegister(BaseModel):
    name: str
    company_name: str
    email: EmailStr
    phone: str
    iec_number: str
    password: str

class ProviderRegisterUser(BaseModel):
    contact_name: str
    company_name: str
    email: EmailStr
    phone: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str