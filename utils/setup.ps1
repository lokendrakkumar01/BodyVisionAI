# setup.ps1 - Complete Setup Script for Windows

Write-Host "Human Body Parts Recognition System - Complete Setup" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org" -ForegroundColor Red
    exit 1
}
Write-Host "OK Python found: $pythonVersion" -ForegroundColor Green

# Create virtual environment if it doesn't exist
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "OK Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install opencv-python==4.8.1.78 mediapipe==0.10.7 numpy==1.24.3

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Yellow
python -c "import cv2; print('OK OpenCV installed')"
python -c "import mediapipe; print('OK MediaPipe installed')"
python -c "import numpy; print('OK NumPy installed')"

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "You can now run: python main.py" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
