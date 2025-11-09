import axios from 'axios';

export interface ImageToPromptRequest {
  imageBase64: string;
  mimeType: string;
}

export interface ImageToPromptResponse {
  prompt: string;
  detectedElements: string[];
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  OpenAI API key not configured. Image-to-prompt feature will not work.');
    }
  }

  async imageToPrompt(request: ImageToPromptRequest): Promise<ImageToPromptResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          temperature: 0.0,
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: "You are a world-class visual analyst and AI prompt engineer. Analyze the provided image and produce one fluent, cinematic English text-to-image prompt written as if the scene was captured by a professional portrait photographer. The final prompt must naturally include a phrase such as 'captured by a professional photographer with visible skin texture and natural facial details.' The description must integrate all 16 conceptual aspects (Subject; Pose/Gesture; Facial Features/Expression; Clothing/Accessories; Lighting; Mood/Emotion; Color Palette & Tone; Composition & Framing; Environment/Background; Camera Specs; Texture & Detail Focus; Artistic Style; Quality Tags; Narrative/Story Hint; Aesthetic Reference; Custom Directive). Emphasize realism, expert lighting, lifelike textures, and cinematic composition. Write it as a single, elegant paragraph — not a list, not numbered, not in JSON. SAFETY RULES: Do NOT specify age, gender, or permanent facial traits. Focus on expression, lighting, and composition. Use neutral terms when unsure (e.g., 'an adult person', 'unspecified background'). Generate the ready-to-use cinematic prompt based on this image:"
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${request.mimeType};base64,${request.imageBase64}`
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const directive = "Do not change the person's face, body proportions, size, or height. Preserve facial features exactly and maintain body proportions as shown in the reference image.";
      const finalPrompt = content.includes(directive)
        ? content
        : `${content.trim()}\n\n${directive}`;

      return {
        prompt: finalPrompt,
        detectedElements: []
      };

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`OpenAI API error: ${message}`);
      }
      throw error;
    }
  }
}
