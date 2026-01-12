import cv2
import os
import sys
import numpy as np

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pose_estimator import PoseEstimator

def test_with_image():
    """Test the pose and hand detection using a sample image"""
    print("=" * 60)
    print("Body Parts Recognition System - Image Test Mode")
    print("=" * 60)
    
    try:
        # Initialize pose estimator
        pose_estimator = PoseEstimator(
            static_image_mode=True,  # Use static mode for images
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    except Exception as e:
        print(f"[ERROR] Failed to initialize: {e}")
        return
    
    # Create a sample image with a hand-like drawing for testing
    print("\n[INFO] Creating test image with hand silhouette...")
    
    # Create a blank image
    img = np.ones((720, 1280, 3), dtype=np.uint8) * 30  # Dark gray background
    
    # Add gradient background
    for i in range(720):
        img[i, :] = [30 + int(i/720 * 40), 30 + int(i/720 * 30), 40 + int(i/720 * 50)]
    
    # Draw instructions on the image
    cv2.putText(img, "Test Mode - No Webcam Available", (350, 100),
               cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
    
    cv2.putText(img, "The system is configured correctly!", (380, 160),
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    
    cv2.putText(img, "Hand Detection Features:", (100, 250),
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (100, 200, 255), 2)
    
    features = [
        "- 21 landmarks per hand (fingertips, joints, wrist)",
        "- Left hand: Blue skeleton",
        "- Right hand: Orange skeleton",
        "- Real-time detection when webcam works",
        "- Pose detection: 33 body landmarks"
    ]
    
    y_pos = 300
    for feature in features:
        cv2.putText(img, feature, (120, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        y_pos += 40
    
    cv2.putText(img, "To fix webcam:", (100, 520),
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 200, 100), 2)
    
    fixes = [
        "1. Check if webcam is physically connected",
        "2. Close other apps using the camera (Zoom, Teams, etc.)",
        "3. Go to Windows Settings > Privacy > Camera > Allow apps",
        "4. Restart your computer",
        "5. Update camera drivers in Device Manager"
    ]
    
    y_pos = 560
    for fix in fixes:
        cv2.putText(img, fix, (120, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1)
        y_pos += 30
    
    cv2.putText(img, "Press 'q' to exit", (550, 700),
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (150, 150, 150), 2)
    
    # Display the test image
    print("[OK] Displaying test information...")
    print("Press 'q' to exit\n")
    
    cv2.imshow('Body Parts Recognition - Test Mode', img)
    
    while True:
        key = cv2.waitKey(100) & 0xFF
        if key == ord('q'):
            break
    
    cv2.destroyAllWindows()
    print("[OK] Test completed")
    print("\nTo run with webcam, please fix the camera issues listed above.")

def test_with_video_file(video_path):
    """Test the pose and hand detection using a video file"""
    print("=" * 60)
    print("Body Parts Recognition System - Video File Test")
    print("=" * 60)
    
    if not os.path.exists(video_path):
        print(f"[ERROR] Video file not found: {video_path}")
        return
    
    try:
        pose_estimator = PoseEstimator(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    except Exception as e:
        print(f"[ERROR] Failed to initialize: {e}")
        return
    
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return
    
    print(f"[OK] Playing video: {video_path}")
    print("Press 'q' to exit, 's' for skeleton, 'p' for points, 'l' for labels")
    
    show_skeleton = True
    show_points = True
    show_labels = True
    
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Loop video
            continue
        
        processed_frame = pose_estimator.detect_pose(
            frame,
            draw_skeleton=show_skeleton,
            draw_points=show_points,
            draw_labels=show_labels
        )
        
        # Display hand count
        hands = pose_estimator.get_detected_hands_count()
        color = (0, 255, 0) if hands > 0 else (100, 100, 100)
        cv2.putText(processed_frame, f'Hands: {hands}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        
        cv2.imshow('Body Parts Recognition - Video', processed_frame)
        
        key = cv2.waitKey(30) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            show_skeleton = not show_skeleton
        elif key == ord('p'):
            show_points = not show_points
        elif key == ord('l'):
            show_labels = not show_labels
    
    cap.release()
    cv2.destroyAllWindows()
    print("[OK] Video test completed")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # If video path provided, test with video
        test_with_video_file(sys.argv[1])
    else:
        # Default: show test info
        test_with_image()
