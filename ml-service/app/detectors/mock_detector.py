import math
import time
from typing import List, Any
from app.detectors.base import BaseDetector
from app.schemas import DetectionResult

class MockDetector(BaseDetector):
    """
    High-fidelity synthetic detection engine for demo and fallback mode.
    Simulates real-world bounding box kinematics and confidence distributions.
    """
    def __init__(self):
        self.frame_counter = 0

    def detect(self, image_data: Any, confidence_threshold: float = 0.5, camera_id: str = "CAM-04", **kwargs) -> List[DetectionResult]:
        self.frame_counter += 1
        t = self.frame_counter * 0.1

        results: List[DetectionResult] = []

        if camera_id == "CAM-04":
            # Server Room: Person #27 walks into the restricted zone
            p27_x1 = 0.28 + 0.12 * math.sin(t * 0.8)
            p27_y1 = 0.35 + 0.08 * math.cos(t * 0.6)
            results.append(DetectionResult(
                id=f"det-p27-{self.frame_counter}",
                track_id=27,
                class_name="person",
                confidence=round(0.92 + 0.05 * math.sin(t), 2),
                bbox=[round(p27_x1, 3), round(p27_y1, 3), round(p27_x1 + 0.15, 3), round(p27_y1 + 0.42, 3)],
                duration=47.0 + self.frame_counter * 0.5
            ))

            # Person #31 standing near doorway
            p31_x1 = 0.65 + 0.03 * math.sin(t * 0.3)
            p31_y1 = 0.48 + 0.02 * math.cos(t * 0.3)
            results.append(DetectionResult(
                id=f"det-p31-{self.frame_counter}",
                track_id=31,
                class_name="person",
                confidence=round(0.89 + 0.03 * math.cos(t), 2),
                bbox=[round(p31_x1, 3), round(p31_y1, 3), round(p31_x1 + 0.14, 3), round(p31_y1 + 0.38, 3)],
                duration=30.0 + self.frame_counter * 0.5
            ))

        elif camera_id == "CAM-02":
            # Parking: Vehicles and person
            results.append(DetectionResult(
                id=f"det-veh12-{self.frame_counter}",
                track_id=12,
                class_name="car",
                confidence=0.96,
                bbox=[0.12, 0.45, 0.42, 0.82],
                duration=120.0
            ))
            results.append(DetectionResult(
                id=f"det-p19-{self.frame_counter}",
                track_id=19,
                class_name="person",
                confidence=0.88,
                bbox=[0.48, 0.40, 0.60, 0.84],
                duration=184.0
            ))

        else:
            # Generic surveillance scene
            results.append(DetectionResult(
                id=f"det-p01-{self.frame_counter}",
                track_id=1,
                class_name="person",
                confidence=0.94,
                bbox=[0.25, 0.35, 0.38, 0.80],
                duration=15.0
            ))
            results.append(DetectionResult(
                id=f"det-v02-{self.frame_counter}",
                track_id=2,
                class_name="car",
                confidence=0.95,
                bbox=[0.55, 0.48, 0.85, 0.85],
                duration=40.0
            ))

        return [r for r in results if r.confidence >= confidence_threshold]
