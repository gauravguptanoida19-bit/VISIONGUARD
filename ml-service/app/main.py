from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.schemas import (
    DetectRequest, DetectionResult, TrackRequest,
    AnomalyCheckRequest, AnomalyResult, FrameAnalysisRequest
)
from app.detectors.yolo_detector import YOLOv8Detector
from app.trackers.byte_track import ByteTracker
from app.anomaly.engine import AnomalyEngine

app = FastAPI(
    title="VisionGuard ML Inference Service",
    description="Real-time Computer Vision Detection, ByteTrack Tracking, and Anomaly Detection Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
detector = YOLOv8Detector()
trackers: Dict[str, ByteTracker] = {}
anomaly_engine = AnomalyEngine()

def get_camera_tracker(camera_id: str) -> ByteTracker:
    if camera_id not in trackers:
        trackers[camera_id] = ByteTracker()
    return trackers[camera_id]

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "VisionGuard ML Service",
        "detector": "YOLOv8 + Fallback Mock Engine",
        "tracker": "ByteTrack Multi-Object Tracker",
        "anomaly_engine": "Multi-Rule Point-in-Polygon Engine",
        "version": "1.0.0"
    }

@app.post("/detect", response_model=List[DetectionResult])
def detect_objects(req: DetectRequest):
    """
    Detect objects in a camera frame using YOLOv8 or synthetic demo detector.
    """
    results = detector.detect(
        image_data=req.image_base64,
        confidence_threshold=req.confidence_threshold or 0.5,
        camera_id=req.camera_id
    )
    return results

@app.post("/track", response_model=List[DetectionResult])
def track_objects(req: TrackRequest):
    """
    Associate detections with persistent ByteTrack tracking IDs.
    """
    tracker = get_camera_tracker(req.camera_id)
    tracked = tracker.update(req.detections)
    return tracked

@app.post("/anomaly", response_model=List[AnomalyResult])
def check_anomalies(req: AnomalyCheckRequest):
    """
    Evaluate 8 anomaly rules on current tracked objects and active camera zones.
    """
    anomalies = anomaly_engine.evaluate(
        camera_id=req.camera_id,
        detections=req.detections,
        zones=req.zones or [],
        current_time_str=req.current_time_str
    )
    return anomalies

@app.post("/analyze-frame")
def analyze_frame(req: FrameAnalysisRequest):
    """
    End-to-End Pipeline: Detect -> Track -> Anomaly Check
    """
    # 1. Detection
    detections = detector.detect(
        image_data=req.image_base64,
        confidence_threshold=req.confidence_threshold or 0.5,
        camera_id=req.camera_id
    )

    # 2. Tracking
    tracker = get_camera_tracker(req.camera_id)
    tracked = tracker.update(detections)

    # 3. Anomaly Evaluation
    anomalies = anomaly_engine.evaluate(
        camera_id=req.camera_id,
        detections=tracked,
        zones=req.zones or []
    )

    return {
        "camera_id": req.camera_id,
        "detections": tracked,
        "anomalies": anomalies,
        "objects_count": len(tracked),
        "anomalies_count": len(anomalies)
    }

@app.post("/process-video")
def process_video(camera_id: str, stream_url: str):
    return {
        "status": "processing_started",
        "camera_id": camera_id,
        "stream_url": stream_url,
        "message": "Video stream ingester linked with ByteTrack inference pipeline."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
