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
          max_tokens: 700,
          messages: [
            {
              role: 'system',
              content: "You are a world-class visual analyst and AI prompt engineer. Analyze the provided image and produce one fluent, cinematic English text-to-image prompt. The description must integrate all 16 conceptual aspects (Subject; Pose/Gesture; Facial Features/Expression; Clothing/Accessories; Lighting; Mood/Emotion; Color Palette & Tone; Composition & Framing; Environment/Background; Camera Specs; Texture & Detail Focus; Artistic Style; Quality Tags; Narrative/Story Hint; Aesthetic Reference; Custom Directive). Write it as a single, elegant paragraph — not a list, not numbered, not in JSON. SAFETY RULES: Do NOT specify age, gender, or permanent facial traits. Focus on expression, lighting, and composition. Use neutral terms when unsure (e.g., 'an adult person', 'unspecified background'). End with the line exactly: Maintain the same pose, lighting, and environment, but replace the model's face with the user's face (use the attached photo for accurate facial identity and expression)."
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Generate the ready-to-use cinematic prompt based on this image:'
                },
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

      return {
        prompt: content,
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
