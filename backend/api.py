"""
Veridian AI - FastAPI Backend
Provides high-performance REST API endpoints for plant disease diagnostic.
"""

import json
import numpy as np
import os
from PIL import Image
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
import uvicorn
from constants import DISEASE_METADATA, DEFAULT_METADATA

# Initialize FastAPI app
app = FastAPI(
    title="Veridian AI Diagnostic Engine",
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
        print("Veridian Engine: Loading AI model...")
        model = load_model(model_path)
        print("✓ Model loaded successfully")
        
        print("Veridian Engine: Loading class names...")
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
    print("VERIDIAN AI DIAGNOSTIC API - STARTING")
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
        "service": "Veridian AI Diagnostic Engine",
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
        
        # Inference
        predictions = model.predict(processed_image, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        disease_name = class_names[predicted_class_idx]
        
        # Get enriched metadata
        metadata = get_recommendation(disease_name)
        
        return {
            "success": True,
            "prediction": {
                "class_name": disease_name,
                "common_name": metadata["common_name"],
                "confidence": round(confidence * 100, 2),
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)