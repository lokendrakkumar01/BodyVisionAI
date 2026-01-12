import subprocess
import sys
import os

def install_package(package):
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"Failed to install {package}")
        return False

def main():
    print("Human Body Parts Recognition System - Dependency Installer")
    print("=" * 60)

    # Create necessary directories
    os.makedirs("utils", exist_ok=True)
    print("Created project directories")

    # Install packages in order
    packages = [
        "opencv-python==4.8.1.78",
        "numpy",
        "mediapipe"
    ]

    print("Installing dependencies...")
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1

    print("\n" + "=" * 60)
    print("Installation Summary:")
    print(f"Dependencies installed: {success_count}/{len(packages)}")

    if success_count == len(packages):
        print("All dependencies installed successfully!")
        print("You can now run: python main.py")
    else:
        print("Some dependencies failed to install.")
        print("Please try manual installation:")
        print("pip install opencv-python numpy mediapipe")

if __name__ == "__main__":
    main()
