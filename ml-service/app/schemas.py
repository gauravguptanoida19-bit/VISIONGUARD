from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class DetectionResult(BaseModel):
    id: str
    track_id: Optional[int] = None
    class_name: str
    confidence: float
    bbox: List[float] # [x1, y1, x2, y2]
    duration: Optional[float] = 0.0

class DetectRequest(BaseModel):
    camera_id: str
    image_base64: Optional[str] = None
    frame_index: Optional[int] = 0
    confidence_threshold: Optional[float] = 0.5

class TrackRequest(BaseModel):
    camera_id: str
    detections: List[DetectionResult]
    frame_index: Optional[int] = 0

class ZonePoint(BaseModel):
    x: float
    y: float

class ZoneDefinition(BaseModel):
    id: str
    name: str
    type: str # 'restricted', 'loitering', 'monitored'
    polygon: List[ZonePoint]
    severity: str = "HIGH"
    dwell_time_threshold_seconds: Optional[float] = 30.0

class AnomalyCheckRequest(BaseModel):
    camera_id: str
    detections: List[DetectionResult]
    zones: Optional[List[ZoneDefinition]] = []
    current_time_str: Optional[str] = None

class AnomalyResult(BaseModel):
    type: str
    camera_id: str
    timestamp: str
    severity: str # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    confidence: float
    description: str
    evidence: Dict[str, Any] = {}

class FrameAnalysisRequest(BaseModel):
    camera_id: str
    image_base64: Optional[str] = None
    zones: Optional[List[ZoneDefinition]] = []
    confidence_threshold: Optional[float] = 0.5
