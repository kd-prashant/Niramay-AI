"""
Metadata and recommendations for Veridian AI
"""

DISEASE_METADATA = {
    "Tomato___Bacterial_spot": {
        "common_name": "Bacterial Spot",
        "severity": "Moderate",
        "treatment": {
            "medicines": [
                "Copper-based bactericides (e.g., Kocide 3000)",
                "Streptomycin sulfate (for early stage)"
            ],
            "organic": [
                "Neem oil spray (1%)",
                "Baking soda solution (1 tsp in 1L water)",
                "Removing infected lower leaves to reduce splash infection"
            ],
            "action_plan": [
                "1. Prune all heavily infected leaves in dry weather.",
                "2. Apply copper fungicide every 7-10 days.",
                "3. Switch to drip irrigation to keep foliage dry."
            ]
        },
        "prevention": "Use pathogen-free seeds, practice 3-year crop rotation, avoid handling wet plants."
    },
    "Tomato___Early_blight": {
        "common_name": "Early Blight (Fungal)",
        "severity": "Low to Moderate",
        "treatment": {
            "medicines": [
                "Chlorothalonil (Daconil)",
                "Mancozeb",
                "Copper fungicides"
            ],
            "organic": [
                "Increase air circulation between plants",
                "Mulch around the base to prevent soil splash",
                "Serenade (Bacillus subtilis) bio-fungicide"
            ],
            "action_plan": [
                "1. Remove infected lower leaves immediately.",
                "2. Apply mulch to create a barrier between soil and leaves.",
                "3. Apply organic or chemical fungicide at first sign."
            ]
        },
        "prevention": "Stake plants for better airflow, rotate crops, avoid overhead watering."
    },
    "Tomato___Late_blight": {
        "common_name": "Late Blight",
        "severity": "Critical",
        "treatment": {
            "medicines": [
                "Chlorothalonil",
                "Copper fungicides (apply daily in wet humid conditions)",
                "Fosetyl-Al (Systemic)"
            ],
            "organic": [
                "Copper soap",
                "Remove and burn/bury the entire plant if it's >50% infected",
                "Actively monitor night humidity"
            ],
            "action_plan": [
                "1. DESTROY infected plants immediately; do not compost.",
                "2. Treat remaining healthy plants with preventative fungicide.",
                "3. Monitor neighbor's fields as this spreads rapidly by wind."
            ]
        },
        "prevention": "Plant resistant varieties, ensure wide spacing, avoid potato-tomato rotation."
    },
    "Tomato___Leaf_Mold": {
        "common_name": "Leaf Mold (Fungal)",
        "severity": "Moderate",
        "treatment": {
            "medicines": ["DIFENOCONAZOLE", "Azoxystrobin"],
            "organic": ["Improve ventilation", "Reduce humidity below 85%"],
            "action_plan": ["1. Ventilate the greenhouse/area.", "2. Prune internal branches for airflow."]
        },
        "prevention": "Maintain low humidity, use drip irrigation."
    },
    "Tomato___Septoria_leaf_spot": {
        "common_name": "Septoria Leaf Spot",
        "severity": "Moderate",
        "treatment": {
            "medicines": ["Mancozeb", "Chlorothalonil"],
            "organic": ["Remove debris from soil", "Staking"],
            "action_plan": ["1. Strip the bottom-most leaves.", "2. Apply a protective spray."]
        },
        "prevention": "Crop rotation, control weeds."
    },
    "Tomato___Spider_mites_Two-spotted_spider_mite": {
        "common_name": "Spider Mites (Pest)",
        "severity": "Moderate to High",
        "treatment": {
            "medicines": ["Abamectin", "Bifenthrin"],
            "organic": ["Strong water spray to knock them off", "Neem oil", "Insecticidal soap"],
            "action_plan": ["1. Hose down the plant.", "2. Apply neem oil every 5 days for 3 cycles."]
        },
        "prevention": "Keep plants hydrated, use predatory mites."
    },
    "Tomato___Target_Spot": {
        "common_name": "Target Spot",
        "severity": "Moderate",
        "treatment": {
            "medicines": ["Chlorothalonil", "Pyraclostrobin"],
            "organic": ["Remove infected foliage", "Solarization"],
            "action_plan": ["1. Apply protective fungicide.", "2. Ensure crop is not nutrient stressed."]
        },
        "prevention": "Remove crop residue, improve drainage."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "common_name": "Yellow Leaf Curl Virus (TYLCV)",
        "severity": "High",
        "treatment": {
            "medicines": ["None (Viral)", "Control Whiteflies using Imidacloprid"],
            "organic": ["Reflective mulch", "Yellow sticky traps", "Instant removal of infected plants"],
            "action_plan": ["1. Use sticky traps to monitor whiteflies.", "2. Cover with fine mesh net.", "3. Remove viral plants instantly."]
        },
        "prevention": "Use virus-indexed seeds, control whitefly population."
    },
    "Tomato___Tomato_mosaic_virus": {
        "common_name": "Tomato Mosaic Virus",
        "severity": "Moderate",
        "treatment": {
            "medicines": ["None (Viral)"],
            "organic": ["Clean tools with bleach", "Do not smoke near plants (Tobacco virus transfer)"],
            "action_plan": ["1. Remove and bury infected plants.", "2. Disinfect all garden tools."]
        },
        "prevention": "Wash hands with soap before handling, use resistant cultivars."
    },
    "Tomato___healthy": {
        "common_name": "Healthy Plant",
        "severity": "None",
        "treatment": {
            "medicines": ["None"],
            "organic": ["Regular composting", "Seaweed extract"],
            "action_plan": ["1. Continue regular monitoring.", "2. Keep the soil moisture consistent."]
        },
        "prevention": "Maintain good hygiene and nutrition."
    },
    "Potato___Early_blight": {
        "common_name": "Early Blight (Potato)",
        "severity": "Moderate",
        "treatment": {
            "medicines": ["Mancozeb", "Chlorothalonil"],
            "organic": ["Companion planting with marigolds", "Compost tea"],
            "action_plan": ["1. Remove yellowing lower leaves.", "2. Ensure adequate nitrogen."]
        },
        "prevention": "Crop rotation, healthy soil."
    },
    "Potato___Late_blight": {
        "common_name": "Late Blight (Potato)",
        "severity": "Critical",
        "treatment": {
            "medicines": ["Metalaxyl", "Copper fungicides"],
            "organic": ["Bury tubers deep", "Harvest during dry weather"],
            "action_plan": ["1. Destroy haulms (vines) if infection is detected.", "2. Harvest tubers carefully to avoid contact with spores."]
        },
        "prevention": "Use certified seed potatoes, remove cull piles."
    },
    "Potato___healthy": {
        "common_name": "Healthy Potato",
        "severity": "None",
        "treatment": {
            "medicines": ["None"],
            "organic": ["Organic manure"],
            "action_plan": ["1. Monitor for pests.", "2. Maintain hilling."]
        },
        "prevention": "Standard maintenance."
    }
}

DEFAULT_METADATA = {
    "common_name": "Unknown Condition",
    "severity": "Moderate",
    "treatment": {
        "medicines": ["Consult a local agricultural expert"],
        "organic": ["General plant hygiene"],
        "action_plan": ["1. Isolate the plant.", "2. Monitor for changes."]
    },
    "prevention": "Ensure proper hygiene and nutrition for your crops."
}
