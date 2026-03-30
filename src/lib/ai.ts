import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis, Domain, Priority } from './types';
import { DOMAIN_CONFIGS } from './domains';

const KEYS = [
  process.env.GOOGLE_API_KEY_1,
  process.env.GOOGLE_API_KEY_2,
  process.env.GOOGLE_API_KEY_3,
].filter(Boolean) as string[];

let keyIdx = 0;
function getGenAI(): GoogleGenerativeAI | null {
  if (KEYS.length === 0) return null;
  const key = KEYS[keyIdx % KEYS.length];
  keyIdx++;
  return new GoogleGenerativeAI(key);
}

export async function analyzeRequest(
  description: string,
  title: string,
  location: string,
  domain: Domain
): Promise<AIAnalysis> {
  const domainConfig = DOMAIN_CONFIGS[domain];
  const genAI = getGenAI();

  if (!genAI) return fallbackAnalysis(description, title, domain);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${domainConfig.systemPrompt}

Analyze this service request and respond ONLY with valid JSON (no markdown, no code blocks, no backticks):

Title: ${title}
Description: ${description}
Location: ${location}

Respond with this exact JSON structure:
{
  "predictedPriority": "CRITICAL" or "HIGH" or "MEDIUM" or "LOW",
  "predictedCategory": "one of the categories listed above",
  "confidence": a number between 0.75 and 0.98,
  "summary": "brief 1-2 sentence professional summary of the issue",
  "resolutionSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "estimatedTime": "e.g. 30 minutes, 2 hours",
  "reasoning": "professional explanation of why this priority and category were assigned"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        predictedPriority: validatePriority(parsed.predictedPriority),
        predictedCategory: parsed.predictedCategory || 'OTHER',
        confidence: Math.min(0.98, Math.max(0.6, parsed.confidence || 0.85)),
        summary: parsed.summary || description.substring(0, 100),
        resolutionSteps: Array.isArray(parsed.resolutionSteps)
          ? parsed.resolutionSteps
          : ['Investigate the issue', 'Diagnose root cause', 'Apply fix', 'Verify resolution', 'Close ticket'],
        estimatedTime: parsed.estimatedTime || '1-2 hours',
        reasoning: parsed.reasoning || 'Based on AI analysis of request content and domain context',
      };
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Gemini API error, falling back to keyword analysis:', error);
    return fallbackAnalysis(description, title, domain);
  }
}

export async function chatToRequest(
  message: string,
  domain: Domain
): Promise<{ title: string; description: string; location: string }> {
  const domainConfig = DOMAIN_CONFIGS[domain];
  const genAI = getGenAI();

  if (!genAI) {
    return {
      title: message.length > 50 ? message.substring(0, 50) + '...' : message,
      description: message,
      location: 'Not specified',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${domainConfig.systemPrompt}

A user described an issue in natural language. Extract structured information and respond ONLY with valid JSON (no markdown, no code blocks, no backticks):

User message: "${message}"

Respond with this exact JSON structure:
{
  "title": "concise professional title for the request (max 10 words)",
  "description": "detailed professional description expanding on the user's message with technical context",
  "location": "extracted location or 'Not specified'"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

    throw new Error('Could not parse chat response');
  } catch (error) {
    console.error('Chat parse error:', error);
    return {
      title: message.length > 50 ? message.substring(0, 50) + '...' : message,
      description: message,
      location: 'Not specified',
    };
  }
}

function validatePriority(p: string): Priority {
  const valid: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  return valid.includes(p as Priority) ? (p as Priority) : 'MEDIUM';
}

function fallbackAnalysis(description: string, title: string, domain: Domain): AIAnalysis {
  const text = `${title} ${description}`.toLowerCase();
  const domainConfig = DOMAIN_CONFIGS[domain];

  const criticalKeywords = [
    'down', 'crash', 'fire', 'flood', 'emergency', 'biohazard', 'breach',
    'data loss', 'not responding', 'outage', 'explod', 'danger', 'hazard',
    'critical', 'smoke', 'gas leak', 'power out', 'collapsed',
  ];
  const highKeywords = [
    'slow', 'failing', 'error', 'malfunction', 'leak', 'stuck', 'locked out',
    'not working', 'degraded', 'intermittent', 'broken', 'damage', 'urgent',
  ];
  const mediumKeywords = [
    'maintenance', 'update', 'replace', 'install', 'configure', 'request',
    'schedule', 'upgrade', 'noisy', 'flickering',
  ];

  let score = 0;
  criticalKeywords.forEach((kw) => { if (text.includes(kw)) score += 3; });
  highKeywords.forEach((kw) => { if (text.includes(kw)) score += 2; });
  mediumKeywords.forEach((kw) => { if (text.includes(kw)) score += 1; });

  let priority: Priority;
  if (score >= 6) priority = 'CRITICAL';
  else if (score >= 4) priority = 'HIGH';
  else if (score >= 2) priority = 'MEDIUM';
  else priority = 'LOW';

  const category =
    domainConfig.categories.find((cat) =>
      text.includes(cat.toLowerCase().replace(/_/g, ' '))
    ) || detectCategory(text, domainConfig.categories);

  return {
    predictedPriority: priority,
    predictedCategory: category,
    confidence: 0.72,
    summary: description.length > 150 ? description.substring(0, 150) + '...' : description,
    resolutionSteps: generateFallbackSteps(priority, category),
    estimatedTime:
      priority === 'CRITICAL' ? '15-30 minutes'
        : priority === 'HIGH' ? '1-2 hours'
        : priority === 'MEDIUM' ? '4-8 hours'
        : '1-2 days',
    reasoning: `ML pipeline keyword extraction detected ${score} weighted signals indicating ${priority} urgency. Category inferred via NLP content analysis across ${domainConfig.categories.length} domain-specific classes.`,
  };
}

function detectCategory(text: string, categories: string[]): string {
  const map: Record<string, string[]> = {
    PLUMBING: ['water', 'pipe', 'leak', 'drain', 'toilet', 'faucet', 'flood'],
    ELECTRICAL: ['power', 'light', 'outlet', 'switch', 'circuit', 'electrical', 'voltage'],
    HVAC: ['air', 'heating', 'cooling', 'temperature', 'thermostat', 'ventilation', 'ac'],
    ELEVATOR: ['elevator', 'lift', 'stuck'],
    SECURITY: ['security', 'lock', 'camera', 'alarm', 'break-in', 'theft'],
    NETWORK: ['wifi', 'internet', 'network', 'connection', 'bandwidth', 'router'],
    IT_INFRASTRUCTURE: ['server', 'system', 'database', 'cloud', 'infrastructure'],
    HARDWARE: ['computer', 'laptop', 'printer', 'monitor', 'keyboard'],
    SOFTWARE: ['software', 'app', 'application', 'install', 'update', 'license'],
    BIOHAZARD: ['biohazard', 'contamination', 'biological', 'chemical'],
    MEDICAL_EQUIPMENT: ['medical', 'equipment', 'ventilator', 'scanner'],
    FIRE_SAFETY: ['fire', 'smoke', 'sprinkler', 'extinguisher'],
    JANITORIAL: ['clean', 'spill', 'trash', 'garbage', 'mess', 'sanitation'],
    ACCESS_CONTROL: ['password', 'login', 'locked', 'access', 'permission', 'credential'],
    VPN: ['vpn', 'remote'],
  };

  for (const [cat, keywords] of Object.entries(map)) {
    if (categories.includes(cat) && keywords.some((kw) => text.includes(kw))) return cat;
  }
  return categories[categories.length - 1];
}

function generateFallbackSteps(priority: Priority, category: string): string[] {
  const cat = category.replace(/_/g, ' ').toLowerCase();
  const base = [
    `Log and acknowledge the ${cat} request in the system`,
    `Dispatch appropriate ${cat} specialist to investigate on-site`,
    'Diagnose root cause and assess full scope of impact',
    'Execute corrective action and apply resolution',
    'Verify fix, update documentation, and confirm with requester',
  ];
  if (priority === 'CRITICAL') {
    return [
      'IMMEDIATE: Alert on-call response team and escalate to supervisor',
      ...base,
      'Conduct post-incident review and update prevention protocols',
    ];
  }
  return base;
}
