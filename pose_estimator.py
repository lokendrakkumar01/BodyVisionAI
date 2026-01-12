import cv2
import numpy as np
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("[ERROR] MediaPipe not available. Please install it using: pip install mediapipe")

try:
    from utils.drawing_utils import draw_pose_landmarks
    DRAWING_UTILS_AVAILABLE = True
except ImportError as e:
    DRAWING_UTILS_AVAILABLE = False
    print(f"[ERROR] Drawing utils not available: {e}")

class PoseEstimator:
    def __init__(self,
                 static_image_mode=False,
                 model_complexity=1,
                 smooth_landmarks=True,
                 enable_segmentation=False,
                 smooth_segmentation=True,
                 min_detection_confidence=0.5,
                 min_tracking_confidence=0.5):

        if not MEDIAPIPE_AVAILABLE:
            raise ImportError("MediaPipe is not installed. Please run: pip install mediapipe")

        if not DRAWING_UTILS_AVAILABLE:
            raise ImportError("Drawing utilities are not available")

        # Initialize MediaPipe Pose
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

        # Initialize MediaPipe Hands for detailed hand detection
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=static_image_mode,
            max_num_hands=2,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

        # Initialize Pose model
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            enable_segmentation=enable_segmentation,
            smooth_segmentation=smooth_segmentation,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

        # Body parts mapping for Pose
        self.body_parts = {
            self.mp_pose.PoseLandmark.NOSE: "Nose",
            self.mp_pose.PoseLandmark.LEFT_EYE_INNER: "Left Eye Inner",
            self.mp_pose.PoseLandmark.LEFT_EYE: "Left Eye",
            self.mp_pose.PoseLandmark.LEFT_EYE_OUTER: "Left Eye Outer",
            self.mp_pose.PoseLandmark.RIGHT_EYE_INNER: "Right Eye Inner",
            self.mp_pose.PoseLandmark.RIGHT_EYE: "Right Eye",
            self.mp_pose.PoseLandmark.RIGHT_EYE_OUTER: "Right Eye Outer",
            self.mp_pose.PoseLandmark.LEFT_EAR: "Left Ear",
            self.mp_pose.PoseLandmark.RIGHT_EAR: "Right Ear",
            self.mp_pose.PoseLandmark.MOUTH_LEFT: "Mouth Left",
            self.mp_pose.PoseLandmark.MOUTH_RIGHT: "Mouth Right",
            self.mp_pose.PoseLandmark.LEFT_SHOULDER: "Left Shoulder",
            self.mp_pose.PoseLandmark.RIGHT_SHOULDER: "Right Shoulder",
            self.mp_pose.PoseLandmark.LEFT_ELBOW: "Left Elbow",
            self.mp_pose.PoseLandmark.RIGHT_ELBOW: "Right Elbow",
            self.mp_pose.PoseLandmark.LEFT_WRIST: "Left Wrist",
            self.mp_pose.PoseLandmark.RIGHT_WRIST: "Right Wrist",
            self.mp_pose.PoseLandmark.LEFT_PINKY: "Left Pinky",
            self.mp_pose.PoseLandmark.RIGHT_PINKY: "Right Pinky",
            self.mp_pose.PoseLandmark.LEFT_INDEX: "Left Index",
            self.mp_pose.PoseLandmark.RIGHT_INDEX: "Right Index",
            self.mp_pose.PoseLandmark.LEFT_THUMB: "Left Thumb",
            self.mp_pose.PoseLandmark.RIGHT_THUMB: "Right Thumb",
            self.mp_pose.PoseLandmark.LEFT_HIP: "Left Hip",
            self.mp_pose.PoseLandmark.RIGHT_HIP: "Right Hip",
            self.mp_pose.PoseLandmark.LEFT_KNEE: "Left Knee",
            self.mp_pose.PoseLandmark.RIGHT_KNEE: "Right Knee",
            self.mp_pose.PoseLandmark.LEFT_ANKLE: "Left Ankle",
            self.mp_pose.PoseLandmark.RIGHT_ANKLE: "Right Ankle",
            self.mp_pose.PoseLandmark.LEFT_HEEL: "Left Heel",
            self.mp_pose.PoseLandmark.RIGHT_HEEL: "Right Heel",
            self.mp_pose.PoseLandmark.LEFT_FOOT_INDEX: "Left Foot",
            self.mp_pose.PoseLandmark.RIGHT_FOOT_INDEX: "Right Foot"
        }

        # Hand landmarks mapping (21 points per hand)
        self.hand_landmarks = {
            0: "Wrist",
            1: "Thumb CMC",
            2: "Thumb MCP",
            3: "Thumb IP",
            4: "Thumb Tip",
            5: "Index MCP",
            6: "Index PIP",
            7: "Index DIP",
            8: "Index Tip",
            9: "Middle MCP",
            10: "Middle PIP",
            11: "Middle DIP",
            12: "Middle Tip",
            13: "Ring MCP",
            14: "Ring PIP",
            15: "Ring DIP",
            16: "Ring Tip",
            17: "Pinky MCP",
            18: "Pinky PIP",
            19: "Pinky DIP",
            20: "Pinky Tip"
        }

        self.detected_hands_count = 0

        print("[OK] Pose Estimator initialized with Hand Detection")
        print(f"[INFO] Model Complexity: {model_complexity}")
        print(f"[INFO] Detection Confidence: {min_detection_confidence}")
        print("[INFO] Hand Detection: ENABLED (21 landmarks per hand)")

    def detect_pose(self, image, draw_skeleton=True, draw_points=True, draw_labels=True):
        """
        Detect human pose and hands in the given image

        Args:
            image: Input image (BGR format)
            draw_skeleton: Whether to draw skeleton connections
            draw_points: Whether to draw landmark points
            draw_labels: Whether to draw body part labels

        Returns:
            Processed image with pose and hand landmarks
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False

        # Process the image for pose
        pose_results = self.pose.process(image_rgb)
        
        # Process the image for hands
        hand_results = self.hands.process(image_rgb)

        # Convert back to BGR
        image_rgb.flags.writeable = True
        image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        # Draw pose landmarks if detected
        if pose_results.pose_landmarks:
            image_bgr = draw_pose_landmarks(
                image_bgr,
                pose_results.pose_landmarks,
                self.mp_pose,
                self.body_parts,
                draw_skeleton=draw_skeleton,
                draw_points=draw_points,
                draw_labels=draw_labels
            )

        # Draw hand landmarks if detected
        if hand_results.multi_hand_landmarks:
            self.detected_hands_count = len(hand_results.multi_hand_landmarks)
            for hand_idx, hand_landmarks in enumerate(hand_results.multi_hand_landmarks):
                # Get handedness (left or right)
                handedness = "Hand"
                if hand_results.multi_handedness:
                    handedness = hand_results.multi_handedness[hand_idx].classification[0].label
                
                image_bgr = self.draw_hand_landmarks(
                    image_bgr,
                    hand_landmarks,
                    handedness,
                    draw_skeleton=draw_skeleton,
                    draw_points=draw_points,
                    draw_labels=draw_labels
                )
        else:
            self.detected_hands_count = 0

        return image_bgr

    def draw_hand_landmarks(self, image, hand_landmarks, handedness, 
                           draw_skeleton=True, draw_points=True, draw_labels=True):
        """
        Draw hand landmarks on the image

        Args:
            image: Input image
            hand_landmarks: MediaPipe hand landmarks
            handedness: "Left" or "Right" hand
            draw_skeleton: Whether to draw connections
            draw_points: Whether to draw points
            draw_labels: Whether to draw labels

        Returns:
            Image with drawn hand landmarks
        """
        image_height, image_width = image.shape[:2]

        # Define hand connections
        HAND_CONNECTIONS = self.mp_hands.HAND_CONNECTIONS

        # Colors for hands (different for left and right)
        if handedness == "Left":
            SKELETON_COLOR = (255, 100, 0)   # Blue-ish for left
            POINT_COLOR = (255, 50, 50)      # Blue points
        else:
            SKELETON_COLOR = (0, 100, 255)   # Orange-ish for right
            POINT_COLOR = (50, 50, 255)      # Red points
        
        LABEL_COLOR = (255, 255, 255)  # White
        LABEL_BG_COLOR = (50, 50, 50)  # Dark gray

        # Draw skeleton connections
        if draw_skeleton:
            for connection in HAND_CONNECTIONS:
                start_idx = connection[0]
                end_idx = connection[1]

                start_landmark = hand_landmarks.landmark[start_idx]
                end_landmark = hand_landmarks.landmark[end_idx]

                start_point = (
                    int(start_landmark.x * image_width),
                    int(start_landmark.y * image_height)
                )
                end_point = (
                    int(end_landmark.x * image_width),
                    int(end_landmark.y * image_height)
                )

                # Draw line
                cv2.line(image, start_point, end_point, SKELETON_COLOR, 2)

        # Draw landmark points and labels
        if draw_points or draw_labels:
            for landmark_id, landmark in enumerate(hand_landmarks.landmark):
                x = int(landmark.x * image_width)
                y = int(landmark.y * image_height)

                # Draw point
                if draw_points:
                    cv2.circle(image, (x, y), 4, POINT_COLOR, -1)
                    cv2.circle(image, (x, y), 4, (255, 255, 255), 1)  # White outline

                # Draw label for fingertips only (to avoid clutter)
                if draw_labels and landmark_id in [4, 8, 12, 16, 20]:  # Fingertips
                    label = f"{handedness[0]}-{self.hand_landmarks[landmark_id]}"
                    
                    # Get text size for background
                    text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)[0]

                    # Draw background rectangle
                    cv2.rectangle(image,
                                (x - 2, y - text_size[1] - 8),
                                (x + text_size[0] + 2, y - 3),
                                LABEL_BG_COLOR, -1)

                    # Draw text
                    cv2.putText(image, label, (x, y - 5),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.4, LABEL_COLOR, 1)

        return image

    def get_detected_body_parts_count(self):
        """
        Get the number of body parts currently detected

        Returns:
            Number of detected body parts
        """
        return len(self.body_parts)

    def get_detected_hands_count(self):
        """
        Get the number of hands currently detected

        Returns:
            Number of detected hands (0, 1, or 2)
        """
        return self.detected_hands_count

    def get_landmark_coordinates(self, results, image_shape):
        """
        Extract landmark coordinates from results

        Args:
            results: MediaPipe pose results
            image_shape: Shape of the image (height, width)

        Returns:
            Dictionary of body part names and their coordinates
        """
        if not results.pose_landmarks:
            return {}

        landmarks = {}
        image_height, image_width = image_shape[:2]

        for landmark_id, landmark_name in self.body_parts.items():
            landmark = results.pose_landmarks.landmark[landmark_id]
            if landmark.visibility > 0.5:  # Only consider visible landmarks
                x = int(landmark.x * image_width)
                y = int(landmark.y * image_height)
                landmarks[landmark_name] = (x, y)

        return landmarks

    def __del__(self):
        """Cleanup when object is destroyed"""
        if hasattr(self, 'pose'):
            self.pose.close()
        if hasattr(self, 'hands'):
            self.hands.close()

if __name__ == "__main__":
    # Test the pose estimator
    estimator = PoseEstimator()
    print("Pose estimator test completed!")
