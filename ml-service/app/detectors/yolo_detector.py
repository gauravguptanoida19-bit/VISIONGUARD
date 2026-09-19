import logging
from typing import List, Any
from app.detectors.base import BaseDetector
from app.detectors.mock_detector import MockDetector
from app.schemas import DetectionResult

logger = logging.getLogger(__name__)

class YOLOv8Detector(BaseDetector):
    """
    Ultralytics YOLOv8 detector with automatic fallback to MockDetector
    if PyTorch or Ultralytics weights are unavailable.
    """
    def __init__(self, model_name: str = "yolov8n.pt"):
        self.model = None
        self.mock_fallback = MockDetector()
        
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_name)
            logger.info(f"Loaded YOLOv8 model: {model_name}")
        except Exception as e:
            logger.warning(f"Ultralytics YOLO unavailable ({e}). Defaulting to MockDetector.")

    def detect(self, image_data: Any, confidence_threshold: float = 0.5, camera_id: str = "CAM-04", **kwargs) -> List[DetectionResult]:
        if self.model is None or image_data is None:
            return self.mock_fallback.detect(image_data, confidence_threshold=confidence_threshold, camera_id=camera_id)

        try:
            results = self.model(image_data, conf=confidence_threshold, verbose=False)
            detections: List[DetectionResult] = []
            
            for r in results:
                boxes = r.boxes
                for i, box in enumerate(boxes):
                    cls_id = int(box.cls[0].item())
                    cls_name = self.model.names.get(cls_id, f"class_{cls_id}")
                    conf = float(box.conf[0].item())
                    coords = [float(x) for x in box.xyxyn[0].tolist()] # Normalized [x1, y1, x2, y2]
                    
                    detections.append(DetectionResult(
                        id=f"det-yolo-{i}",
                        class_name=cls_name,
                        confidence=round(conf, 2),
                        bbox=coords,
                        duration=0.0
                    ))
            return detections
        except Exception as e:
            logger.error(f"YOLO inference error ({e}). Returning fallback detections.")
            return self.mock_fallback.detect(image_data, confidence_threshold=confidence_threshold, camera_id=camera_id)
