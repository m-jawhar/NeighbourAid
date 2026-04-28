import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'demo-key');

function isGeminiConfigured() {
  return Boolean(apiKey && apiKey !== 'your_gemini_api_key');
}

export async function getVolunteerMatches(crisisType, location, volunteers) {
  if (!isGeminiConfigured()) {
    return getMockMatches(crisisType, volunteers);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an emergency response coordinator AI for NeighborAid, a community crisis platform in Kerala, India.

EMERGENCY: ${crisisType} at ${location}

AVAILABLE COMMUNITY VOLUNTEERS (pre-registered, within 2km):
${volunteers
  .map(
    (v, i) =>
      `${i + 1}. ID:${v.id} | Skills:${v.skills.join(', ')} | Assets:${v.assets.join(', ')} | Distance:${Math.round(v.distance)}m | Languages:${v.languages.join(', ')}`,
  )
  .join('\n')}

SELECT the optimal 3-6 volunteers for this specific emergency. 
For a FLOOD: prioritize boat owners, swimmers, then medical, then multilingual volunteers for isolated elders.
For a FIRE: prioritize medical first, then drivers for evacuation, then translators.
For MEDICAL: prioritize doctors/nurses first, then drivers.

For each selected volunteer, assign a SPECIFIC task based on their exact skills.

RESPOND WITH ONLY VALID JSON — no markdown, no explanation:
{
  "selected": [
    {
      "id": "v001",
      "anonymizedName": "Volunteer_1",
      "primarySkill": "Doctor",
      "distanceMeters": 340,
      "skillMatchPercent": 95,
      "assignedTask": "Provide emergency medical triage to trapped family at Church Road junction — 3 adults, 1 child with suspected injuries",
      "priority": 1,
      "estimatedArrival": "4 minutes"
    }
  ],
  "coordinatorBrief": "One sentence summary for the coordinator dashboard",
  "totalResponseCapacity": "What this team can collectively handle"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini API error:', error);
    return getMockMatches(crisisType, volunteers);
  }
}

function getMockMatches(crisisType, volunteers) {
  const sorted = [...volunteers].sort((a, b) => a.distance - b.distance);
  const top3 = sorted.slice(0, Math.min(4, sorted.length));
  const taskMap = {
    'Flash Flood': [
      'Operate rescue boat for rooftop evacuation near the flooded canal crossing',
      'Provide first aid and hypothermia support to rescued residents at the parish hall shelter',
      'Assist elderly residents with Malayalam-language reassurance and headcount verification',
      'Restore essential power using portable backup support once water levels stabilize',
    ],
    'Structure Fire': [
      'Triage burn and smoke inhalation victims beside the bus stand access lane',
      'Transport critical patients to the nearest available hospital route',
      'Coordinate multilingual evacuation instructions for nearby shops and homes',
      'Secure the electrical mains and portable power risks near the affected structure',
    ],
    'Medical Emergency': [
      'Administer emergency medical care while the patient remains shelter-in-place',
      'Transport the patient through the fastest open route to emergency care',
      'Assist paramedics with intake details and crowd management',
      'Provide backup support and medication retrieval if requested by the lead clinician',
    ],
  };
  const tasks = taskMap[crisisType] || taskMap['Medical Emergency'];

  return {
    selected: top3.map((volunteer, index) => ({
      id: volunteer.id,
      anonymizedName: `Volunteer_${index + 1}`,
      primarySkill: volunteer.skills[0],
      distanceMeters: Math.round(volunteer.distance),
      skillMatchPercent: Math.max(78, 96 - index * 6),
      assignedTask: tasks[index] || 'Provide general emergency assistance near the incident zone',
      priority: index + 1,
      estimatedArrival: `${Math.max(2, Math.round(volunteer.distance / 90))} minutes`,
    })),
    coordinatorBrief: `${top3.length} local responders were identified with a balanced mix of rescue, care, and communication capacity for ${crisisType.toLowerCase()}.`,
    totalResponseCapacity: 'Rapid evacuation support, medical triage, multilingual coordination, and basic utility stabilization',
  };
}

export async function getCrisisAnalysis(crisisData) {
  if (!isGeminiConfigured()) {
    return {
      summary: `${crisisData.type} confirmed in ${crisisData.location}. ${crisisData.signals.length} behavioral signals detected. Immediate community response recommended.`,
      riskLevel: crisisData.severity === 'critical' ? 'Critical' : crisisData.severity === 'high' ? 'High' : 'Moderate',
      recommendedActions: [
        'Activate Break-Glass immediately',
        'Deploy 4-6 community responders',
        'Alert district emergency services',
        'Set up a local community coordination point',
      ],
      estimatedDuration: crisisData.type === 'Flash Flood' ? '2-4 hours active response needed' : '1-3 hours active response needed',
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `You are an emergency operations analyst for NeighborAid in Kerala, India.

Analyze this crisis event and return only valid JSON:
{
  "summary": "short operational summary",
  "riskLevel": "Critical | High | Moderate",
  "recommendedActions": ["action 1", "action 2", "action 3", "action 4"],
  "estimatedDuration": "time estimate"
}

Crisis type: ${crisisData.type}
Location: ${crisisData.location}
Severity: ${crisisData.severity}
Confidence: ${crisisData.confidence}
Signals:
${crisisData.signals.map((signal) => `- ${signal}`).join('\n')}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini crisis analysis error:', error);
    return {
      summary: `${crisisData.type} in ${crisisData.location} shows strong escalation indicators and requires immediate localized coordination.`,
      riskLevel: crisisData.severity === 'critical' ? 'Critical' : 'High',
      recommendedActions: [
        'Confirm situational awareness with field responders',
        'Activate minimum-necessary data access',
        'Dispatch priority responders first',
        'Maintain audit trail and re-evaluate every 15 minutes',
      ],
      estimatedDuration: '2 hours of close monitoring recommended',
    };
  }
}
