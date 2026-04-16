"""
Veridian AI - FastAPI Backend
Provides high-performance REST API endpoints for plant disease diagnostic.
"""

import json
import numpy as np
import os
from PIL import Image
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
import uvicorn
from constants import DISEASE_METADATA, DEFAULT_METADATA
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

# Load security environment variables
load_dotenv()

# Initialize Gemini AI Client
# Initialize Gemini AI Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("Niramay Engine: Synchronizing available AI brains...")
        # Check available models but don't crash if discovery fails
        try:
            for m in client.models.list():
                print(f"  - Available ID: {m.name}")
        except Exception as discovery_error:
            print(f"Niramay Engine Warning: Discovery incomplete: {discovery_error}")
    except Exception as e:
        print(f"ERROR: Failed to initialize AI Client: {e}")
        client = None
else:
    print("WARNING: GEMINI_API_KEY not found in environment. Chat features will be disabled.")



class ChatRequest(BaseModel):
    message: str
    disease_context: str = None
    language: str = "EN"


# Initialize FastAPI app
app = FastAPI(
    title="Niramay AI Diagnostic Engine",
    description="Advanced plant health decision support API",
    version="2.0.0"
)

# Add CORS middleware to allow Next.js calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
class_names = None
IMG_SIZE = 224

def load_resources():
    """Load model and class names once at startup"""
    global model, class_names
    
    # Get current directory to ensure paths work if run from root
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, 'plant_disease_model.h5')
    classes_path = os.path.join(base_path, 'class_names.json')
    
    try:
        print("Niramay Engine: Loading AI model...")
        model = load_model(model_path)
        print("✓ Model loaded successfully")
        
        print("Niramay Engine: Loading class names...")
        with open(classes_path, 'r') as f:
            class_names = json.load(f)
        print(f"✓ Loaded {len(class_names)} disease classes")
        
    except FileNotFoundError as e:
        print(f"ERROR: Required file not found - {e}")
        print("Ensure model files are in the backend/ directory.")
        raise
    except Exception as e:
        print(f"ERROR: Failed to load resources - {e}")
        raise

def preprocess_image(image: Image.Image):
    """Preprocess image for model prediction"""
    img = image.resize((IMG_SIZE, IMG_SIZE))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def get_recommendation(disease_name: str):
    """Get detailed treatment recommendations from the metadata database"""
    metadata = DISEASE_METADATA.get(disease_name, DEFAULT_METADATA)
    
    return {
        "common_name": metadata["common_name"],
        "severity": metadata["severity"],
        "treatment": metadata["treatment"],
        "prevention": metadata["prevention"]
    }

@app.on_event("startup")
async def startup_event():
    """Load resources when API starts"""
    print("=" * 60)
    print("NIRAMAY AI DIAGNOSTIC API - STARTING")
    print("=" * 60)
    load_resources()
    print("=" * 60)
    print("API is ready to accept requests!")
    print("=" * 60)

@app.get("/")
async def root():
    """API health check endpoint"""
    return {
        "status": "online",
        "service": "Niramay AI Diagnostic Engine",
        "version": "2.0.0",
        "features": ["Image Classification", "Treatment Recommendations", "Severity Analysis"]
    }

@app.get("/classes")
async def get_classes():
    """Get list of all disease classes"""
    if class_names is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return {
        "total_classes": len(class_names),
        "classes": class_names
    }

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Predict crop disease with confidence scores and detailed recommendations
    """
    if model is None or class_names is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        processed_image = preprocess_image(image)
        
        # 🛡️ BIOLOGICAL SIGNATURE CHECK (UNIVERSAL FIX)
        # Check if the image contains enough "Botany" colors (Greens, Yellows, Browns)
        hsv_image = image.convert('HSV')
        h = np.array(hsv_image.split()[0]) # Hue channel
        # Leaves are typically in Hue 30-90 (Green) or 0-30 (Yellow/Brown/Diseased)
        # We check if a decent % of pixels fall in the plant range
        plant_pixels = np.sum((h < 90) & (h > 10)) 
        is_biological = (plant_pixels / (image.size[0] * image.size[1])) > 0.15

        if not is_biological:
            return {
                "success": True,
                "prediction": {
                    "common_name": "Invalid Sample",
                    "class_name": "NON_PLANT_IMAGE",
                    "confidence": 0,
                    "severity": "None"
                },
                "recommendations": {
                    "treatment": {"medicines": ["N/A"], "organic": ["N/A"], "action_plan": ["Please upload a clear photo of a crop leaf."]},
                    "prevention": ["N/A"]
                }
            }

        # Inference
        predictions = model.predict(processed_image, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx]) * 100
        disease_name = class_names[predicted_class_idx]
        
        # Get enriched metadata
        metadata = get_recommendation(disease_name)
        
        return {
            "success": True,
            "prediction": {
                "class_name": disease_name,
                "common_name": metadata["common_name"],
                "confidence": round(confidence, 2),
                "severity": metadata["severity"]
            },
            "recommendations": {
                "treatment": metadata["treatment"],
                "prevention": metadata["prevention"]
            }
        }
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    """
    Expert AI Chat interface for farmers
    """
    if not client:
        raise HTTPException(status_code=503, detail="Chat engine currently unavailable")
    
    try:
        # Construct a high-fidelity system prompt for the Plant Doctor persona
        primary_lang = "HINDI" if request.language == "HI" else "ENGLISH"
        
        system_persona = (
            "You are the Niramay AI Plant Doctor, a world-class agricultural expert. "
            "Your tone is professional, encouraging, and deeply knowledgeable about crops like Tomato, Potato, and Pepper. "
            f"The user's preferred interface language is {primary_lang}. "
            "IMPORTANT: If the user asks their question in a specific language (like Hindi or English), "
            "you MUST respond in that same language regardless of the interface setting. "
            "Provide specific, actionable steps for treatment and follow-up. "
        )

        context_aware_prompt = system_persona
        if request.disease_context:
            context_aware_prompt += f"The user just scanned a leaf and the diagnosis was: {request.disease_context}. Focus your advice on this specific condition. "
        
        full_query = f"{context_aware_prompt}\n\nFarmer Question: {request.message}"

        # Using the exact alias found in your discovery list
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=full_query
        )
        
        return {
            "success": True,
            "response": response.text,
            "persona": "Plant Doctor"
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"Chat Engine Error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {error_msg}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)