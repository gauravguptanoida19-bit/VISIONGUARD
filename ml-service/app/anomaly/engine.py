import time
import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.schemas import DetectionResult, ZoneDefinition, AnomalyResult

def point_in_polygon(x: float, y: float, polygon: List[Any]) -> bool:
    """
    Ray-casting point-in-polygon algorithm.
    Returns True if (x, y) is inside the polygon.
    """
    num_points = len(polygon)
    if num_points < 3:
        return False

    inside = False
    p1 = polygon[0]
    p1x = p1.x if hasattr(p1, 'x') else p1['x']
    p1y = p1.y if hasattr(p1, 'y') else p1['y']

    for i in range(1, num_points + 1):
        p2 = polygon[i % num_points]
        p2x = p2.x if hasattr(p2, 'x') else p2['x']
        p2y = p2.y if hasattr(p2, 'y') else p2['y']

        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

class AnomalyEngine:
    """
    Real-time multi-rule anomaly detection engine.
    Supports point-in-polygon zone containment, dwell time loitering,
    abandoned object heuristics, and crowd density thresholding.
    """
    def __init__(
        self,
        default_loiter_seconds: float = 30.0,
        abandoned_object_seconds: float = 45.0,
        crowd_density_threshold: int = 15
    ):
        self.default_loiter_seconds = default_loiter_seconds
        self.abandoned_object_seconds = abandoned_object_seconds
        self.crowd_density_threshold = crowd_density_threshold
        # Track loiter dwell times per trackId: { track_id: (first_seen_in_zone, zone_id) }
        self.zone_dwell: Dict[int, Dict[str, float]] = {}

    def evaluate(
        self,
        camera_id: str,
        detections: List[DetectionResult],
        zones: List[ZoneDefinition],
        current_time_str: Optional[str] = None
    ) -> List[AnomalyResult]:
        anomalies: List[AnomalyResult] = []
        now_ts = datetime.utcnow().isoformat() + "Z"

        # 1. Evaluate Restricted Zones & Loitering
        for det in detections:
            bbox = det.bbox
            # Center of bottom boundary (footprint position for perspective accuracy)
            foot_x = (bbox[0] + bbox[2]) / 2.0
            foot_y = bbox[3]

            for zone in zones:
                is_inside = point_in_polygon(foot_x, foot_y, zone.polygon)

                if is_inside:
                    # RULE 1: Restricted Zone Entry
                    if zone.type == "restricted":
                        anomalies.append(AnomalyResult(
                            type="restricted_zone_entry",
                            camera_id=camera_id,
                            timestamp=now_ts,
                            severity=zone.severity or "HIGH",
                            confidence=0.95,
                            description=f"{det.class_name.capitalize()} #{det.track_id} breached restricted zone '{zone.name}'.",
                            evidence={
                                "track_id": det.track_id,
                                "zone_id": zone.id,
                                "zone_name": zone.name,
                                "foot_coordinates": [round(foot_x, 3), round(foot_y, 3)],
                                "class": det.class_name
                            }
                        ))

                    # RULE 2: Loitering in monitored area
                    elif zone.type == "loitering":
                        dwell_threshold = zone.dwell_time_threshold_seconds or self.default_loiter_seconds
                        duration = det.duration or 0.0

                        if duration >= dwell_threshold:
                            anomalies.append(AnomalyResult(
                                type="loitering",
                                camera_id=camera_id,
                                timestamp=now_ts,
                                severity=zone.severity or "MEDIUM",
                                confidence=0.88,
                                description=f"Subject #{det.track_id} loitering in '{zone.name}' for {int(duration)}s (threshold: {int(dwell_threshold)}s).",
                                evidence={
                                    "track_id": det.track_id,
                                    "duration_seconds": duration,
                                    "threshold_seconds": dwell_threshold,
                                    "zone_name": zone.name
                                }
                            ))

        # RULE 3: Abandoned Object Detection (Backpack, suitcase, box unattended)
        bags = [d for d in detections if d.class_name in ["backpack", "suitcase"]]
        persons = [d for d in detections if d.class_name == "person"]

        for bag in bags:
            bag_center = [(bag.bbox[0] + bag.bbox[2]) / 2, (bag.bbox[1] + bag.bbox[3]) / 2]
            # Check nearest person distance
            nearest_person_dist = 999.0
            for person in persons:
                p_center = [(person.bbox[0] + person.bbox[2]) / 2, (person.bbox[1] + person.bbox[3]) / 2]
                dist = math.hypot(bag_center[0] - p_center[0], bag_center[1] - p_center[1])
                if dist < nearest_person_dist:
                    nearest_person_dist = dist

            # If no person within 0.25 normalized distance and duration > threshold
            if nearest_person_dist > 0.25 and (bag.duration or 0) >= self.abandoned_object_seconds:
                anomalies.append(AnomalyResult(
                    type="abandoned_object",
                    camera_id=camera_id,
                    timestamp=now_ts,
                    severity="HIGH",
                    confidence=0.91,
                    description=f"Unattended {bag.class_name} #{bag.track_id} detected with no associated person in vicinity for {int(bag.duration or 0)}s.",
                    evidence={
                        "track_id": bag.track_id,
                        "class": bag.class_name,
                        "duration": bag.duration,
                        "nearest_person_distance": round(nearest_person_dist, 3)
                    }
                ))

        # RULE 4: Unusual Crowd Surge / Density
        person_count = len(persons)
        if person_count >= self.crowd_density_threshold:
            anomalies.append(AnomalyResult(
                type="unusual_crowd",
                camera_id=camera_id,
                timestamp=now_ts,
                severity="MEDIUM",
                confidence=0.90,
                description=f"High crowd density surge detected: {person_count} persons in camera frame (threshold: {self.crowd_density_threshold}).",
                evidence={"person_count": person_count, "threshold": self.crowd_density_threshold}
            ))

        return anomalies
