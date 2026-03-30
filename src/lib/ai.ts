import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis, Priority } from './types';
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

const CFG = DOMAIN_CONFIGS.apartment;

export async function analyzeRequest(
  description: string,
  title: string,
  location: string,
): Promise<AIAnalysis> {
  const genAI = getGenAI();
  if (!genAI) return fallbackAnalysis(description, title);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `${CFG.systemPrompt}

Analyze this apartment service request and respond ONLY with valid JSON (no markdown, no code blocks):

Title: ${title}
Description: ${description}
Location: ${location}

Respond with this exact JSON structure:
{
  "predictedPriority": "CRITICAL" or "HIGH" or "MEDIUM" or "LOW",
  "predictedCategory": "one of: ${CFG.categories.join(', ')}",
  "confidence": a number between 0.75 and 0.98,
  "summary": "brief 1-2 sentence professional summary",
  "resolutionSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "estimatedTime": "e.g. 30 minutes, 2 hours",
  "reasoning": "explanation of why this priority and category"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const p = JSON.parse(jsonMatch[0]);
      return {
        predictedPriority: validatePriority(p.predictedPriority),
        predictedCategory: p.predictedCategory || 'OTHER',
        confidence: Math.min(0.98, Math.max(0.6, p.confidence || 0.85)),
        summary: p.summary || description.substring(0, 100),
        resolutionSteps: Array.isArray(p.resolutionSteps) ? p.resolutionSteps : defaultSteps(),
        estimatedTime: p.estimatedTime || '1-2 hours',
        reasoning: p.reasoning || 'Based on AI analysis',
      };
    }
    throw new Error('Parse failed');
  } catch (err) {
    console.error('Gemini error, using fallback:', err);
    return fallbackAnalysis(description, title);
  }
}

export async function chatToRequest(
  message: string,
): Promise<{ title: string; description: string; location: string }> {
  const genAI = getGenAI();
  if (!genAI) return { title: message.slice(0, 50), description: message, location: 'Not specified' };

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `${CFG.systemPrompt}

A tenant described an issue in natural language. Extract structured info. Respond ONLY with valid JSON (no markdown):

Tenant message: "${message}"

{
  "title": "concise title (max 10 words)",
  "description": "detailed professional description with context",
  "location": "extracted location or 'Not specified'"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Parse failed');
  } catch {
    return { title: message.slice(0, 50), description: message, location: 'Not specified' };
  }
}

export async function adminChat(message: string, context?: string): Promise<string> {
  const genAI = getGenAI();
  if (!genAI) return 'AI assistant is unavailable. Please check API keys.';

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `${CFG.systemPrompt}

You are the AI assistant for the property management admin. Help them with managing apartment service requests, understanding patterns, drafting responses to tenants, and providing maintenance guidance.

${context ? `Current context (recent requests summary):\n${context}\n` : ''}
Admin question: "${message}"

Provide a helpful, professional, and actionable response. If relevant, suggest specific actions the admin can take.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return 'Sorry, I could not process that request. Please try again.';
  }
}

function validatePriority(p: string): Priority {
  const valid: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  return valid.includes(p as Priority) ? (p as Priority) : 'MEDIUM';
}

function defaultSteps(): string[] {
  return ['Log and acknowledge the request', 'Dispatch maintenance team', 'Diagnose the issue on-site', 'Apply corrective fix', 'Verify and close ticket'];
}

function fallbackAnalysis(description: string, title: string): AIAnalysis {
  const text = `${title} ${description}`.toLowerCase();

  const criticalKw = ['flood', 'fire', 'gas leak', 'collapse', 'electr', 'smoke', 'trapped', 'emergency', 'burst pipe', 'power out', 'no water', 'sewage', 'carbon monoxide'];
  const highKw = ['leak', 'no hot water', 'broken lock', 'no heat', 'no ac', 'elevator stuck', 'ceiling damage', 'mold', 'security breach', 'broken window'];
  const medKw = ['noise', 'pest', 'roach', 'mouse', 'rat', 'flickering', 'clog', 'drip', 'stain', 'crack', 'parking', 'smell', 'appliance'];

  let score = 0;
  criticalKw.forEach((k) => { if (text.includes(k)) score += 3; });
  highKw.forEach((k) => { if (text.includes(k)) score += 2; });
  medKw.forEach((k) => { if (text.includes(k)) score += 1; });

  let priority: Priority;
  if (score >= 6) priority = 'CRITICAL';
  else if (score >= 4) priority = 'HIGH';
  else if (score >= 2) priority = 'MEDIUM';
  else priority = 'LOW';

  const catMap: Record<string, string[]> = {
    PLUMBING: ['water', 'pipe', 'leak', 'drain', 'toilet', 'faucet', 'flood', 'sewage'],
    ELECTRICAL: ['power', 'light', 'outlet', 'switch', 'circuit', 'voltage', 'wire'],
    HVAC: ['heat', 'cool', 'ac', 'air condition', 'thermostat', 'ventilation', 'temperature'],
    ELEVATOR: ['elevator', 'lift', 'stuck'],
    SECURITY: ['lock', 'camera', 'alarm', 'break-in', 'theft', 'gate', 'intercom'],
    PEST_CONTROL: ['pest', 'bug', 'roach', 'cockroach', 'mouse', 'rat', 'ant', 'termite'],
    JANITORIAL: ['clean', 'spill', 'trash', 'garbage', 'sanitation', 'dirty'],
    NOISE_COMPLAINT: ['noise', 'loud', 'music', 'party', 'barking', 'construction'],
    PARKING: ['parking', 'garage', 'car', 'vehicle', 'tow'],
    STRUCTURAL: ['wall', 'ceiling', 'floor', 'crack', 'window', 'door', 'mold'],
    APPLIANCE: ['refrigerator', 'oven', 'stove', 'dishwasher', 'washer', 'dryer', 'microwave'],
  };

  let category = 'OTHER';
  for (const [cat, keywords] of Object.entries(catMap)) {
    if (keywords.some((k) => text.includes(k))) { category = cat; break; }
  }

  return {
    predictedPriority: priority,
    predictedCategory: category,
    confidence: 0.72,
    summary: description.length > 150 ? description.substring(0, 150) + '...' : description,
    resolutionSteps: [
      `Log the ${category.replace(/_/g, ' ').toLowerCase()} request and notify maintenance team`,
      `Dispatch ${category.replace(/_/g, ' ').toLowerCase()} specialist to Unit/Location`,
      'Conduct on-site inspection and diagnose root cause',
      'Execute repair and apply corrective measures',
      'Verify fix with tenant and close the request',
    ],
    estimatedTime: priority === 'CRITICAL' ? '15-30 minutes' : priority === 'HIGH' ? '1-2 hours' : priority === 'MEDIUM' ? '4-8 hours' : '1-2 days',
    reasoning: `Keyword analysis detected ${score} weighted signals indicating ${priority} urgency. Category classified as ${category} based on content matching across apartment-specific taxonomies.`,
  };
}
