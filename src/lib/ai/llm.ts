import { PageBuilderSchema } from '../../types/builder';
import { TelemetryHub } from '../observability/telemetry';

export interface LLMGenerationResult {
  success: boolean;
  adaptedSchema: PageBuilderSchema;
  error?: string;
}

export class EdgeLLMConnector {
  private static apiKey = process.env.OPENAI_API_KEY || '';
  private static endpoint = 'https://api.openai.com/v1/chat/completions';

  /**
   * 1. REAL LLM ADAPTATION & COPYWRITING GENERATOR (Optimization #1)
   * Securely calls OpenAI / DeepSeek APIs directly on the Edge Runtime.
   * Leverages advanced LLM models to dynamically rewrite professional copywriting headlines,
   * generate high-intent SEO metadata, and map emotional color themes based on the prompt input.
   */
  public static async generateAdaptedSchema(
    prompt: string,
    baseSchema: PageBuilderSchema
  ): Promise<LLMGenerationResult> {
    
    TelemetryHub.trackEvent('LLM_GENERATION_REQUESTED', { pageId: baseSchema.pageId, promptLength: prompt.length });

    // If API Key is missing, fallback gracefully to our high-performance algorithmic dictionary
    if (!this.apiKey) {
      console.warn('[AI LLM Connector] OPENAI_API_KEY missing. Gracefully bypassing to local dictionary adapter.');
      return { success: false, adaptedSchema: baseSchema, error: 'API_KEY_NOT_CONFIGURED' };
    }

    const systemPrompt = `
      You are an expert Copywriter, Conversion Rate Optimizer (CRO), and No-Code SaaS Architect.
      Your task is to take a base landing page JSON schema, analyze the user's natural language request, and return a modified, optimized, high-converting PageBuilderSchema JSON.
      
      CRITICAL INSTRUCTIONS:
      1. ONLY modify the H1/H2 text props, CTA buttons labels, primary/secondary/background colors, and SEO meta title/descriptions.
      2. Keep the rootBlockId, blocks IDs, tree children hierarchy exactly identical.
      3. Return a clean, valid, strictly minified JSON conforming to PageBuilderSchema. No markdown wrapper, no conversational text.
    `;

    const userMessage = `
      User prompt instruction: "${prompt}"
      Base Page Schema JSON to modify:
      ${JSON.stringify(baseSchema)}
    `;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // High speed, low cost model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          response_format: { type: 'json_object' }, // Enforces JSON output
          temperature: 0.2, // Keep deterministic
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API Rejected Request');
      }

      const rawContent = data.choices[0].message.content;
      const adaptedSchema: PageBuilderSchema = JSON.parse(rawContent);

      TelemetryHub.trackEvent('LLM_GENERATION_SUCCESSFUL', { pageId: baseSchema.pageId });

      return {
        success: true,
        adaptedSchema,
      };

    } catch (err: any) {
      TelemetryHub.logError('LLM_GENERATION_FAILED', err, { pageId: baseSchema.pageId });
      return {
        success: false,
        adaptedSchema: baseSchema,
        error: err.message,
      };
    }
  }
}
