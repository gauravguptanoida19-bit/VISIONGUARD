import time
from typing import List, Dict, Tuple, Optional
from app.schemas import DetectionResult

def calculate_iou(boxA: List[float], boxB: List[float]) -> float:
    # Determine the (x, y)-coordinates of the intersection rectangle
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0.0, xB - xA) * max(0.0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    denom = float(boxAArea + boxBArea - interArea)
    if denom <= 0:
        return 0.0
    return interArea / denom

class TrackState:
    def __init__(self, track_id: int, bbox: List[float], class_name: str):
        self.track_id = track_id
        self.bbox = bbox
        self.class_name = class_name
        self.first_seen = time.time()
        self.last_seen = time.time()
        self.hits = 1
        self.time_since_update = 0
        self.velocity = [0.0, 0.0]

    def update(self, new_bbox: List[float]):
        now = time.time()
        dt = max(0.01, now - self.last_seen)
        # Compute velocity vector from center delta
        old_center = [(self.bbox[0] + self.bbox[2]) / 2, (self.bbox[1] + self.bbox[3]) / 2]
        new_center = [(new_bbox[0] + new_bbox[2]) / 2, (new_bbox[1] + new_bbox[3]) / 2]
        self.velocity = [(new_center[0] - old_center[0]) / dt, (new_center[1] - old_center[1]) / dt]

        self.bbox = new_bbox
        self.last_seen = now
        self.hits += 1
        self.time_since_update = 0

    @property
    def duration(self) -> float:
        return round(self.last_seen - self.first_seen, 1)

class ByteTracker:
    """
    ByteTrack implementation for multi-object tracking.
    Preserves track IDs through occlusions by two-stage IoU association.
    """
    def __init__(self, iou_threshold: float = 0.3, max_lost_frames: int = 30):
        self.tracks: Dict[int, TrackState] = {}
        self.next_id = 100
        self.iou_threshold = iou_threshold
        self.max_lost_frames = max_lost_frames

    def update(self, detections: List[DetectionResult]) -> List[DetectionResult]:
        # If detection already has preset track_id (e.g. from Mock), preserve it
        tracked_results: List[DetectionResult] = []

        # Split into high & low confidence
        high_conf = [d for d in detections if d.confidence >= 0.6]
        low_conf = [d for d in detections if d.confidence < 0.6]

        matched_tracks = set()

        # Associate high-confidence detections first
        for det in high_conf:
            best_iou = 0.0
            best_track_id = None

            for tid, track in self.tracks.items():
                if tid in matched_tracks or track.class_name != det.class_name:
                    continue
                iou = calculate_iou(det.bbox, track.bbox)
                if iou > best_iou:
                    best_iou = iou
                    best_track_id = tid

            if best_track_id is not None and best_iou >= self.iou_threshold:
                self.tracks[best_track_id].update(det.bbox)
                matched_tracks.add(best_track_id)
                det.track_id = best_track_id
                det.duration = self.tracks[best_track_id].duration
            else:
                # Use det's own track_id if provided or generate new
                assigned_id = det.track_id if det.track_id is not None else self.next_id
                if det.track_id is None:
                    self.next_id += 1
                self.tracks[assigned_id] = TrackState(assigned_id, det.bbox, det.class_name)
                matched_tracks.add(assigned_id)
                det.track_id = assigned_id
                det.duration = 1.0

            tracked_results.append(det)

        # Associate low-confidence detections with remaining tracks to handle occlusion
        for det in low_conf:
            best_iou = 0.0
            best_track_id = None
            for tid, track in self.tracks.items():
                if tid in matched_tracks or track.class_name != det.class_name:
                    continue
                iou = calculate_iou(det.bbox, track.bbox)
                if iou > best_iou:
                    best_iou = iou
                    best_track_id = tid

            if best_track_id is not None and best_iou >= self.iou_threshold:
                self.tracks[best_track_id].update(det.bbox)
                matched_tracks.add(best_track_id)
                det.track_id = best_track_id
                det.duration = self.tracks[best_track_id].duration
                tracked_results.append(det)

        # Age unmatched tracks
        lost_ids = []
        for tid, track in self.tracks.items():
            if tid not in matched_tracks:
                track.time_since_update += 1
                if track.time_since_update > self.max_lost_frames:
                    lost_ids.append(tid)

        for lid in lost_ids:
            del self.tracks[lid]

        return tracked_results
