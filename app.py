"""
Crop Health & Disease Diagnostic App - Professional Premium UI
Clean, modern, perfectly aligned interface
"""

import streamlit as st
import requests
from PIL import Image
import io

# API Configuration
API_URL = "http://localhost:8000/predict"

# Page configuration
st.set_page_config(
    page_title="CropAI - Disease Detection",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Professional Custom CSS
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Hide Streamlit elements */
    #MainMenu, footer, header {visibility: hidden;}
    .stDeployButton {display: none;}
    
    /* Main container */
    .stApp {
        background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
        color: #ffffff;
    }
    
    /* Remove default padding */
    .block-container {
        padding-top: 3rem !important;
        padding-bottom: 3rem !important;
        max-width: 1400px !important;
    }
    
    /* Header Section */
    .header-container {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
        border-radius: 24px;
        padding: 3rem 2rem;
        margin-bottom: 3rem;
        text-align: center;
        box-shadow: 0 20px 60px rgba(99, 102, 241, 0.3);
    }
    
    .header-title {
        font-size: 3.5rem;
        font-weight: 800;
        color: white;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }
    
    .header-subtitle {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 400;
    }
    
    /* Card Styling */
    .custom-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 2rem;
        height: 100%;
        transition: all 0.3s ease;
    }
    
    .custom-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(99, 102, 241, 0.5);
    }
    
    .card-header {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    /* Upload Section */
    .stFileUploader {
        background: rgba(99, 102, 241, 0.1);
        border: 2px dashed rgba(99, 102, 241, 0.5);
        border-radius: 16px;
        padding: 2rem;
    }
    
    .stFileUploader:hover {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.15);
    }
    
    /* Image Display */
    .stImage {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        margin: 1.5rem 0;
    }
    
    /* Results Card */
    .result-box {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 20px;
        padding: 2.5rem;
        margin: 1.5rem 0;
        box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
    }
    
    .disease-title {
        font-size: 2rem;
        font-weight: 800;
        color: white;
        margin: 1rem 0;
        text-transform: capitalize;
    }
    
    .confidence-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    
    .stat-item {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
    }
    
    .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: white;
        display: block;
    }
    
    .stat-label {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 0.5rem;
    }
    
    /* Info Cards */
    .info-card {
        background: rgba(99, 102, 241, 0.1);
        border-left: 4px solid #6366f1;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    
    .info-card h3 {
        color: #a5b4fc;
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
    }
    
    .info-card p {
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.7;
        font-size: 1rem;
    }
    
    /* Progress Bar */
    .progress-container {
        margin: 1.5rem 0;
    }
    
    .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-weight: 600;
    }
    
    .progress-bar-bg {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        height: 12px;
        overflow: hidden;
    }
    
    .progress-bar-fill {
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        height: 100%;
        border-radius: 10px;
        transition: width 1s ease;
    }
    
    /* Button */
    .stButton>button {
        width: 100%;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        font-weight: 700;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        letter-spacing: 0.02em;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6);
    }
    
    /* Stats Footer */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-top: 3rem;
    }
    
    .stat-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.75rem;
        text-align: center;
    }
    
    .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .stat-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.95rem;
        margin-top: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Alert Box */
    .alert-info {
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 12px;
        padding: 1.25rem;
        color: #93c5fd;
        margin: 1.5rem 0;
    }
    
    /* Success Badge */
    .success-badge {
        display: inline-block;
        background: rgba(16, 185, 129, 0.2);
        border: 2px solid #10b981;
        color: #10b981;
        padding: 0.5rem 1.25rem;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    
    /* Text Styles */
    h1, h2, h3, p, label, span, div {
        color: white;
    }
    
    /* Spinner Override */
    .stSpinner > div {
        border-top-color: #6366f1 !important;
    }
    </style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
    <div class="header-container">
        <div class="header-title">🌿 CropAI Diagnostics</div>
        <div class="header-subtitle">Advanced Machine Learning • Real-time Detection • Expert Recommendations</div>
    </div>
""", unsafe_allow_html=True)

# Main Content
col1, col2 = st.columns([5, 5], gap="large")

with col1:
    st.markdown("""
        <div class="custom-card">
            <div class="card-header">📤 Upload Plant Image</div>
        </div>
    """, unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader(
        "Drag and drop or browse",
        type=['jpg', 'jpeg', 'png'],
        help="Upload a clear image of a diseased plant leaf",
        label_visibility="collapsed"
    )
    
    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, use_container_width=True)
        
        st.markdown(f"""
            <div class="info-card">
                <h3>📋 Image Details</h3>
                <p><strong>File:</strong> {uploaded_file.name}<br>
                <strong>Size:</strong> {image.size[0]} × {image.size[1]} px<br>
                <strong>Format:</strong> {image.format}</p>
            </div>
        """, unsafe_allow_html=True)

with col2:
    st.markdown("""
        <div class="custom-card">
            <div class="card-header">🔬 Diagnosis Results</div>
        </div>
    """, unsafe_allow_html=True)
    
    if uploaded_file:
        if st.button("🚀 ANALYZE DISEASE", type="primary"):
            with st.spinner("Analyzing image with AI..."):
                try:
                    img_bytes = uploaded_file.getvalue()
                    files = {'file': (uploaded_file.name, img_bytes, uploaded_file.type)}
                    response = requests.post(API_URL, files=files, timeout=30)
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        if result['success']:
                            disease = result['disease']
                            confidence = result['confidence']
                            severity = result['severity']
                            treatment = result['recommendation']['treatment']
                            prevention = result['recommendation']['prevention']
                            
                            st.markdown('<span class="success-badge">✓ Analysis Complete</span>', unsafe_allow_html=True)
                            
                            st.markdown(f"""
                                <div class="result-box">
                                    <h2 style="color: white; margin: 0; font-size: 1.3rem; font-weight: 600;">Detected Disease</h2>
                                    <div class="disease-title">{disease.replace('___', ' - ').replace('_', ' ')}</div>
                                    <div class="confidence-section">
                                        <div class="stat-item">
                                            <span class="stat-value">{confidence}%</span>
                                            <span class="stat-label">Confidence</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-value" style="font-size: 1.5rem;">{severity}</span>
                                            <span class="stat-label">Severity</span>
                                        </div>
                                    </div>
                                </div>
                            """, unsafe_allow_html=True)
                            
                            st.markdown(f"""
                                <div class="progress-container">
                                    <div class="progress-label">
                                        <span>Confidence Score</span>
                                        <span>{confidence}%</span>
                                    </div>
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="width: {confidence}%;"></div>
                                    </div>
                                </div>
                            """, unsafe_allow_html=True)
                            
                            st.markdown(f"""
                                <div class="info-card">
                                    <h3>💊 Treatment Recommendations</h3>
                                    <p>{treatment}</p>
                                </div>
                            """, unsafe_allow_html=True)
                            
                            st.markdown(f"""
                                <div class="info-card">
                                    <h3>🛡️ Prevention Measures</h3>
                                    <p>{prevention}</p>
                                </div>
                            """, unsafe_allow_html=True)
                        
                        else:
                            st.error("Analysis failed. Please try again.")
                    else:
                        st.error(f"Server error: {response.status_code}")
                
                except requests.exceptions.ConnectionError:
                    st.markdown("""
                        <div class="alert-info">
                            <strong>⚠️ Connection Error</strong><br>
                            Unable to connect to API server. Ensure the backend is running on port 8000.
                        </div>
                    """, unsafe_allow_html=True)
                
                except Exception as e:
                    st.error(f"Error: {str(e)}")
    else:
        st.markdown("""
            <div class="alert-info">
                👈 Upload a plant leaf image to begin AI-powered disease detection
            </div>
        """, unsafe_allow_html=True)

# Statistics Footer
st.markdown("""
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number">98.6%</div>
            <div class="stat-text">Accuracy</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">5</div>
            <div class="stat-text">Diseases</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">&lt;2s</div>
            <div class="stat-text">Speed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">AI</div>
            <div class="stat-text">Powered</div>
        </div>
    </div>
""", unsafe_allow_html=True)

# Footer
st.markdown("""
    <div style="text-align: center; padding: 3rem 0 1rem; color: rgba(255,255,255,0.4);">
        <p style="font-size: 0.95rem;">Powered by MobileNetV2 • TensorFlow • FastAPI</p>
    </div>
""", unsafe_allow_html=True)