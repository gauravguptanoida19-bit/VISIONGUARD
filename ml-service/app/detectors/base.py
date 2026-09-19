from abc import ABC, abstractmethod
from typing import List, Any
from app.schemas import DetectionResult

class BaseDetector(ABC):
    @abstractmethod
    def detect(self, image_data: Any, confidence_threshold: float = 0.5, **kwargs) -> List[DetectionResult]:
        """
        Process an image frame and return detected bounding boxes and classes.
        """
        pass
