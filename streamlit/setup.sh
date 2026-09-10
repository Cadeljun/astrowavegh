#!/bin/bash

# AstroWave Streamlit Dashboard Setup

echo "🎭 Setting up AstroWave Dashboard..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the dashboard:"
echo "  cd streamlit"
echo "  streamlit run app.py"
echo ""
echo "📁 Place your Firebase serviceAccountKey.json in this folder"
echo "   Get it from: Firebase Console → Project Settings → Service Accounts → Generate new private key"
