import { GoogleGenAI } from '@google/genai';
import { Incident, AIAnalysisReport } from '@visionguard/shared';
import { config } from '../config';

export class AIService {
  private static instance: AIService;
  private genAIClient: GoogleGenAI | null = null;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  constructor() {
    if (config.ai.geminiApiKey) {
      try {
        this.genAIClient = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });
        console.log('✨ Initialized Google GenAI client with model:', config.ai.geminiModel);
      } catch (err) {
        console.warn('⚠️ Could not initialize Google GenAI SDK:', err);
      }
    }
  }

  /**
   * Analyze an incident using Gemini LLM, with fallback heuristic reasoning.
   */
  public async analyzeIncident(incident: Incident): Promise<AIAnalysisReport> {
    if (this.genAIClient && config.ai.geminiApiKey) {
      try {
        return await this.analyzeWithGemini(incident);
      } catch (error: any) {
        console.warn('⚠️ Gemini API analysis failed or rate limited, falling back to local analyst engine:', error.message);
      }
    }

    return this.generateHeuristicAnalysis(incident);
  }

  private async analyzeWithGemini(incident: Incident): Promise<AIAnalysisReport> {
    const prompt = `
You are the lead AI Vision Analyst at VisionGuard Cybersecurity & Physical Security Operations.
Analyze the following security incident detected by our computer vision surveillance system.
Return a STRICT JSON object without markdown fences, with these exact keys:
- summary (string: 1-2 sentence concise executive overview)
- whatHappened (string: clear factual description of the activity observed)
- whyFlagged (string: the specific policy, zone rule, or threshold that triggered the alert)
- relevantObjects (array of strings: key entities involved, e.g. ["Person #27", "Server Rack Bay 4"])
- timeline (array of objects with "time" string and "event" string)
- possibleExplanation (string: cautious hypothesis using wording like 'Possible', 'Detected', 'Likely', 'Requires review'. Do NOT make overconfident assertions)
- recommendedSteps (array of strings: 3-4 actionable security SOP response steps)
- confidence (number between 0.80 and 0.99)

INCIDENT DATA:
- ID: ${incident.incidentNumber}
- Camera: ${incident.cameraName} (${incident.location})
- Anomaly Type: ${incident.type}
- Severity: ${incident.severity}
- Timestamp: ${incident.timestamp}
- Duration: ${incident.duration} seconds
- Description: ${incident.description}
- Detected Objects: ${JSON.stringify(incident.detectedObjects || [])}
`;

    const response = await this.genAIClient!.models.generateContent({
      model: config.ai.geminiModel || 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary,
      whatHappened: parsed.whatHappened,
      whyFlagged: parsed.whyFlagged,
      relevantObjects: parsed.relevantObjects || [],
      timeline: parsed.timeline || [],
      possibleExplanation: parsed.possibleExplanation,
      recommendedSteps: parsed.recommendedSteps || [],
      confidence: parsed.confidence || 0.94,
      generatedAt: new Date().toISOString(),
      modelUsed: config.ai.geminiModel || 'gemini-3.8-flash',
    };
  }

  public generateHeuristicAnalysis(incident: Incident): AIAnalysisReport {
    const objects = incident.detectedObjects || [];
    const objectSummary = objects.length > 0 
      ? objects.map(o => `${o.class.toUpperCase()} #${o.trackId} (confidence: ${(o.confidence * 100).toFixed(0)}%)`).join(', ')
      : 'Unclassified entities in camera frame';

    const typeDetails: Record<string, { why: string; explanation: string; steps: string[] }> = {
      restricted_zone_entry: {
        why: `Camera ${incident.cameraId} has a high-security polygon boundary enforced 24/7. Spatial coordinates overlapped with zero-tolerance perimeter.`,
        explanation: 'Possible unauthorized entry by maintenance contractor or security intrusion attempt; trajectory shows direct ingress without badge credential verification.',
        steps: [
          'Dispatch on-site rapid response patrol to verify credentials.',
          'Cross-reference physical badge swipe records at adjacent perimeter doors.',
          'Preserve and export 5-minute video buffer for formal evidentiary review.',
        ],
      },
      loitering: {
        why: `Subject remained stationary in monitored zone for ${incident.duration}s, exceeding configured dwell threshold of 30 seconds.`,
        explanation: 'Likely reconnaissance, awaiting rendezvous, or innocent hesitation; dwell time exceeds baseline transit time by >300%.',
        steps: [
          'Transmit automated public address notice or dispatch floor monitor.',
          'Check adjacent camera feeds for coordinated secondary activity.',
          'Log subject appearance metrics for ongoing facial/clothing re-identification.',
        ],
      },
      abandoned_object: {
        why: 'Object designated as unattended remained stationary for >45s without correlated person entity within 10-meter perimeter.',
        explanation: 'Possible forgotten luggage or intentional suspicious concealment; no owner detected in immediate vicinity.',
        steps: [
          'Deploy security guard to inspect the unattended object from a safe standoff distance.',
          'Review camera timeline backwards to pinpoint identity of the individual who deposited the item.',
          'Establish precautionary 15-meter cordon if contents cannot be verified.',
        ],
      },
      unusual_crowd: {
        why: 'Pedestrian density surged beyond nominal threshold (>20 persons/min) triggering crowd choke-point anomaly.',
        explanation: 'Likely shift transition, evacuation drill, or event dispersal; density creates safety and bottleneck hazards.',
        steps: [
          'Open secondary auxiliary egress gates to ease flow bottlenecks.',
          'Verify with facility management if shift handover is scheduled.',
          'Monitor crowd velocity vectors for indicators of panic or stampede.',
        ],
      },
      after_hours_movement: {
        why: 'Activity detected outside authorized operating hours (facility schedule indicates closed status).',
        explanation: 'Detected personnel movement during facility dark hours; possible unscheduled maintenance or unauthorized breach.',
        steps: [
          'Alert night supervisor and activate perimeter spotlights.',
          'Verify authorized overtime contractor schedule with building administration.',
          'Track subject egress vectors across outer perimeter cameras.',
        ],
      },
    };

    const info = typeDetails[incident.type] || {
      why: `Computer vision model registered anomaly flag with severity ${incident.severity} based on tracking heuristics.`,
      explanation: 'Detected anomalous pattern requiring visual human-in-the-loop analyst triage.',
      steps: [
        'Review high-resolution evidence frames.',
        'Corroborate with adjacent camera telemetry.',
        'Update incident triage status once cleared.',
      ],
    };

    const timeStr = new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      summary: `Automated detection of ${incident.type.replace(/_/g, ' ')} on ${incident.cameraName} (${incident.location}).`,
      whatHappened: `System tracked ${objectSummary} exhibiting anomalous spatial or temporal behavior for ${incident.duration} seconds.`,
      whyFlagged: info.why,
      relevantObjects: objects.map(o => `${o.class.toUpperCase()} #${o.trackId}`).concat([incident.cameraName]),
      timeline: [
        { time: timeStr, event: `Anomaly triggered by automated vision tracking engine` },
        { time: timeStr, event: `Evidence frames captured and uploaded to incident record` },
        { time: timeStr, event: `Real-time WebSocket alert pushed to operator consoles` },
      ],
      possibleExplanation: info.explanation,
      recommendedSteps: info.steps,
      confidence: 0.93,
      generatedAt: new Date().toISOString(),
      modelUsed: 'visionguard-analyst-heuristic-v1',
    };
  }
}

export const aiService = AIService.getInstance();
