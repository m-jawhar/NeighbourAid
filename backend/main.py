import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Allow CORS for development if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Twilio configuration
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.environ.get("TWILIO_WHATSAPP_NUMBER")

# Initialize Twilio Client only if credentials exist
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None

class WhatsAppMessage(BaseModel):
    phone: str
    message: str

@app.post("/api/whatsapp")
async def send_whatsapp(payload: WhatsAppMessage):
    if not twilio_client:
        raise HTTPException(status_code=500, detail="Twilio credentials are not configured in the backend.")

    # Clean the phone number and ensure it starts with whatsapp:+
    # Ex: if frontend sends "9876543210" or "+919876543210"
    clean_phone = payload.phone.replace(" ", "").replace("-", "")
    if not clean_phone.startswith("+"):
        clean_phone = "+" + clean_phone
    
    formatted_phone = f"whatsapp:{clean_phone}"

    try:
        message = twilio_client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=payload.message,
            to=formatted_phone
        )
        return {"success": True, "messageSid": message.sid, "status": message.status}
    except Exception as e:
        print(f"Twilio API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
