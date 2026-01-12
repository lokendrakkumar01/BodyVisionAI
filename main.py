import cv2
import time
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pose_estimator import PoseEstimator

def main():
    print("Human Body Parts Recognition System")
    print("=" * 50)
    print("Press 'q' to quit")
    print("Press 's' to toggle skeleton display")
    print("Press 'p' to toggle points display")
    print("Press 'l' to toggle labels display")

    try:
        # Initialize pose estimator
        pose_estimator = PoseEstimator(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    except Exception as e:
        print(f"Error initializing pose estimator: {e}")
        print("Please make sure all dependencies are installed.")
        print("Run: python install_dependencies.py")
        return

    # Initialize webcam with retry logic
    print("Initializing webcam...")
    cap = None
    camera_indices = [0, 1, 2]  # Try multiple camera indices
    camera_backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]
    
    for cam_idx in camera_indices:
        for backend in camera_backends:
            print(f"  Trying camera {cam_idx} with backend {backend}...")
            cap = cv2.VideoCapture(cam_idx, backend)
            if cap.isOpened():
                # Allow camera to warm up
                time.sleep(0.5)
                # Read multiple test frames to verify camera works
                for _ in range(5):
                    ret, test_frame = cap.read()
                    if ret and test_frame is not None:
                        print(f"[OK] Webcam initialized (camera {cam_idx})")
                        break
                else:
                    cap.release()
                    cap = None
                    continue
                break
            else:
                cap = None
        if cap is not None and cap.isOpened():
            break
    
    if cap is None or not cap.isOpened():
        print("[ERROR] Could not open webcam")
        print("[TIP] Make sure your webcam is connected and not in use by another application")
        print("[TIP] Try closing any other apps that might be using the camera")
        return

    # Set camera resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # Display settings
    show_skeleton = True
    show_points = True
    show_labels = True

    # FPS calculation
    fps_start_time = time.time()
    fps_frame_count = 0
    fps = 0

    # Frame error counter for retry logic
    frame_error_count = 0
    max_frame_errors = 10

    print("Starting pose estimation...")

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            frame_error_count += 1
            if frame_error_count >= max_frame_errors:
                print("[ERROR] Too many failed frame captures. Exiting...")
                break
            continue
        
        # Reset error counter on successful frame
        frame_error_count = 0

        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)

        # Process frame for pose estimation
        try:
            processed_frame = pose_estimator.detect_pose(
                frame,
                draw_skeleton=show_skeleton,
                draw_points=show_points,
                draw_labels=show_labels
            )
        except Exception as e:
            print(f"[ERROR] Error during pose detection: {e}")
            processed_frame = frame

        # Calculate FPS
        fps_frame_count += 1
        if time.time() - fps_start_time >= 1.0:
            fps = fps_frame_count
            fps_frame_count = 0
            fps_start_time = time.time()

        # Display FPS and settings
        cv2.putText(processed_frame, f'FPS: {fps}', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        settings_text = f"Skeleton: {'ON' if show_skeleton else 'OFF'} | " \
                       f"Points: {'ON' if show_points else 'OFF'} | " \
                       f"Labels: {'ON' if show_labels else 'OFF'}"
        cv2.putText(processed_frame, settings_text, (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Display detected body parts count
        body_parts_count = pose_estimator.get_detected_body_parts_count()
        cv2.putText(processed_frame, f'Body Parts Detected: {body_parts_count}', (10, 100),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        # Display detected hands count
        hands_count = pose_estimator.get_detected_hands_count()
        hands_color = (0, 255, 0) if hands_count > 0 else (100, 100, 100)
        cv2.putText(processed_frame, f'Hands Detected: {hands_count}', (10, 130),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, hands_color, 2)

        # Display the frame
        cv2.imshow('Human Body Parts Recognition', processed_frame)

        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            show_skeleton = not show_skeleton
            print(f"[SETTING] Skeleton display: {'ON' if show_skeleton else 'OFF'}")
        elif key == ord('p'):
            show_points = not show_points
            print(f"[SETTING] Points display: {'ON' if show_points else 'OFF'}")
        elif key == ord('l'):
            show_labels = not show_labels
            print(f"[SETTING] Labels display: {'ON' if show_labels else 'OFF'}")

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("System stopped successfully")

if __name__ == "__main__":
    main()
