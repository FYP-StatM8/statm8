#!/bin/bash

echo "Setting up StatM8 Data Analytics API Server..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "Setup complete!"
echo "To start the server:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Set your Groq key in .env file"
echo "3. Run: python app.py"
echo "4. Or run with uvicorn: uvicorn app:app --reload --host 0.0.0.0 --port 8000"
