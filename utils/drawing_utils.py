import cv2
import mediapipe as mp

def draw_pose_landmarks(image, pose_landmarks, mp_pose, body_parts,
                        draw_skeleton=True, draw_points=True, draw_labels=True):
    """
    Draw pose landmarks, connections, and labels on the image

    Args:
        image: Input image
        pose_landmarks: MediaPipe pose landmarks
        mp_pose: MediaPipe pose module
        body_parts: Dictionary mapping landmark IDs to names
        draw_skeleton: Whether to draw skeleton connections
        draw_points: Whether to draw landmark points
        draw_labels: Whether to draw body part labels

    Returns:
        Image with drawn landmarks
    """
    image_height, image_width = image.shape[:2]

    # Define connections for skeleton (pairs of landmark indices)
    POSE_CONNECTIONS = mp_pose.POSE_CONNECTIONS

    # Define colors
    SKELETON_COLOR = (0, 255, 0)  # Green
    POINT_COLOR = (0, 0, 255)     # Red
    LABEL_COLOR = (255, 255, 255) # White
    LABEL_BG_COLOR = (0, 0, 0)    # Black

    # Draw skeleton connections
    if draw_skeleton:
        for connection in POSE_CONNECTIONS:
            start_idx = connection[0]
            end_idx = connection[1]

            start_landmark = pose_landmarks.landmark[start_idx]
            end_landmark = pose_landmarks.landmark[end_idx]

            # Only draw if both landmarks are visible
            if start_landmark.visibility > 0.5 and end_landmark.visibility > 0.5:
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
        for landmark_id, landmark in enumerate(pose_landmarks.landmark):
            if landmark.visibility > 0.5:  # Only draw visible landmarks
                x = int(landmark.x * image_width)
                y = int(landmark.y * image_height)

                # Draw point
                if draw_points:
                    cv2.circle(image, (x, y), 5, POINT_COLOR, -1)

                # Draw label
                if draw_labels and landmark_id in body_parts:
                    label = body_parts[landmark_id]

                    # Get text size for background
                    text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]

                    # Draw background rectangle
                    cv2.rectangle(image,
                                (x - 5, y - text_size[1] - 10),
                                (x + text_size[0] + 5, y - 5),
                                LABEL_BG_COLOR, -1)

                    # Draw text
                    cv2.putText(image, label, (x, y - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, LABEL_COLOR, 1)

    return image

def get_body_part_color(body_part_name):
    """
    Get color for different body parts

    Args:
        body_part_name: Name of the body part

    Returns:
        BGR color tuple
    """
    color_map = {
        'head': (255, 0, 0),      # Blue
        'shoulder': (0, 255, 0),  # Green
        'elbow': (0, 255, 255),   # Yellow
        'wrist': (255, 255, 0),   # Cyan
        'hip': (255, 0, 255),     # Magenta
        'knee': (0, 165, 255),    # Orange
        'ankle': (128, 0, 128),   # Purple
        'foot': (255, 192, 203)   # Pink
    }

    body_part_lower = body_part_name.lower()

    for key, color in color_map.items():
        if key in body_part_lower:
            return color

    return (0, 0, 255)  # Default red

if __name__ == "__main__":
    print("Drawing utilities loaded successfully!")
