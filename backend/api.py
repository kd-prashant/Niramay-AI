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
from google.genai import types
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

async def verify_plant_with_vision(image_bytes: bytes) -> dict:
    """
    Stage 1: Use Gemini Vision to verify if the image contains a plant/leaf.
    Returns: { "is_plant": bool, "plant_type": str, "description": str }
    """
    if not client:
        # Fallback: if Gemini isn't available, skip verification
        return {"is_plant": True, "plant_type": "unknown", "description": "Verification unavailable"}
    
    try:
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        
        prompt = (
            "Analyze this image carefully. Answer in STRICT JSON format only, no extra text.\n"
            "{\n"
            '  "is_plant": true/false,\n'
            '  "plant_type": "exact plant/crop name if identifiable, else unknown",\n'
            '  "description": "brief visual description of what you see"\n'
            "}\n\n"
            "Rules:\n"
            "- is_plant must be TRUE only if the image clearly shows a plant, leaf, crop, or vegetation.\n"
            "- is_plant must be FALSE for animals, people, objects, screens, food, etc.\n"
            "- If it IS a plant, identify the species/crop name as precisely as possible.\n"
        )
        
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=[image_part, prompt]
        )
        
        # Parse the JSON from Gemini's response
        raw = response.text.strip()
        # Handle markdown code blocks if Gemini wraps the JSON
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        
        result = json.loads(raw)
        return result
        
    except Exception as e:
        print(f"Vision Verification Warning: {e}")
        # On failure, allow the image through (don't block the user)
        return {"is_plant": True, "plant_type": "unknown", "description": "Verification failed"}


async def diagnose_with_vision(image_bytes: bytes, plant_type: str) -> dict:
    """
    Stage 3: Use Gemini Vision to diagnose an unknown plant that our local model can't handle.
    Returns data in the SAME format as our local model response.
    """
    if not client:
        return None
    
    try:
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        
        prompt = (
            f"You are an expert plant pathologist. The plant in this image has been identified as: '{plant_type}'.\n"
            "Analyze the leaf/plant for any diseases, infections, or health issues.\n"
            "Respond in STRICT JSON format only, no extra text:\n"
            "{\n"
            '  "common_name": "Disease name or Healthy Plant",\n'
            '  "class_name": "technical_classification_name",\n'
            '  "confidence": 85,\n'
            '  "severity": "None/Low/Moderate/High/Critical",\n'
            '  "treatment": {\n'
            '    "medicines": ["medicine1", "medicine2"],\n'
            '    "organic": ["organic solution 1", "organic solution 2"],\n'
            '    "action_plan": ["1. Step one.", "2. Step two.", "3. Step three."]\n'
            '  },\n'
            '  "prevention": "Prevention advice here"\n'
            "}\n\n"
            "Rules:\n"
            "- confidence should be your realistic estimate (0-100).\n"
            "- If the plant looks healthy, set severity to None and common_name to 'Healthy [Plant Name]'.\n"
            "- Provide real, scientifically accurate medicines and treatments.\n"
        )
        
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=[image_part, prompt]
        )
        
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        
        return json.loads(raw)
        
    except Exception as e:
        print(f"Vision Diagnosis Error: {e}")
        return None


# Known crops that our local model handles well
KNOWN_CROPS = ["potato", "tomato", "pepper", "bell pepper"]

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Universal Plant Disease Predictor - 3-Stage Pipeline:
    Stage 1: Gemini Vision verifies it's a plant (rejects non-botanical subjects)
    Stage 2: Local TF model for known crops (fast, precise)
    Stage 3: Gemini Vision fallback for unknown plant species (universal)
    """
    if model is None or class_names is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STAGE 1: VISUAL GATEKEEPER (Is it a plant?)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        verification = await verify_plant_with_vision(image_data)
        
        if not verification.get("is_plant", False):
            return {
                "success": True,
                "prediction": {
                    "common_name": "Invalid Sample",
                    "class_name": "NON_PLANT_IMAGE",
                    "confidence": 0,
                    "severity": "None"
                },
                "recommendations": {
                    "treatment": {
                        "medicines": ["N/A"],
                        "organic": ["N/A"],
                        "action_plan": [
                            f"Detected: {verification.get('description', 'Non-plant object')}.",
                            "Please upload a clear photo of a plant leaf or crop.",
                            "Ensure the leaf fills most of the frame for best results."
                        ]
                    },
                    "prevention": ["N/A"]
                }
            }
        
        detected_plant = verification.get("plant_type", "unknown").lower()
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STAGE 2: LOCAL MODEL (For known crops)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        is_known_crop = any(crop in detected_plant for crop in KNOWN_CROPS)
        
        if is_known_crop:
            processed_image = preprocess_image(image)
            predictions = model.predict(processed_image, verbose=0)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx]) * 100
            disease_name = class_names[predicted_class_idx]
            
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
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STAGE 3: UNIVERSAL ENGINE (For unknown plants)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        vision_result = await diagnose_with_vision(image_data, detected_plant)
        
        if vision_result:
            return {
                "success": True,
                "prediction": {
                    "class_name": vision_result.get("class_name", f"{detected_plant}_analysis"),
                    "common_name": vision_result.get("common_name", detected_plant.title()),
                    "confidence": vision_result.get("confidence", 75),
                    "severity": vision_result.get("severity", "Moderate")
                },
                "recommendations": {
                    "treatment": vision_result.get("treatment", {
                        "medicines": ["Consult a local agricultural expert"],
                        "organic": ["General plant hygiene"],
                        "action_plan": ["1. Isolate the plant.", "2. Monitor for changes.", "3. Seek expert advice."]
                    }),
                    "prevention": vision_result.get("prevention", "Maintain good crop hygiene and nutrition.")
                }
            }
        
        # Final fallback: if everything fails, use local model anyway
        processed_image = preprocess_image(image)
        predictions = model.predict(processed_image, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx]) * 100
        disease_name = class_names[predicted_class_idx]
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
            "You are the 'Niramay AI Plant Doctor', an elite digital agronomist. "
            "Your personality is precise, empathetic, and authoritative. "
            "You specialize in identifying and treating crop diseases like Late Blight, Bacterial Spot, and Early Blight. "
            f"The interface is currently set to {primary_lang}, however: "
            "CRITICAL: If the user asks their question in Hindi, you MUST respond in Hindi. "
            "CRITICAL: Use Markdown for formatting. Use **Bold** for emphasis, Bullet points for lists, and Header ### for sections. "
            "STRUCTURE: Always provide: 1. A summary of the problem. 2. A 3-step 'Crisis Protocol'. 3. Both Organic and Chemical options if applicable. "
        )

        context_aware_prompt = system_persona
        if request.disease_context:
            context_aware_prompt += (
                f"\n\nSCAN CONTEXT: The farmer just performed an AI scan. The result was '{request.disease_context}'. "
                "Instead of asking what the problem is, acknowledge this scan and provide immediate, specific remediation steps "
                f"for {request.disease_context}. Be decisive."
            )
        
        full_query = f"{context_aware_prompt}\n\nFARMER INQUIRY: {request.message}"

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