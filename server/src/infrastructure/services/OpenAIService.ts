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
              content: "You are a world-class visual analyst and AI prompt engineer. Analyze the provided image and produce one fluent, cinematic English text-to-image prompt written as if the scene was captured by a professional portrait photographer. The final prompt must naturally include a phrase such as 'captured by a professional photographer with visible skin texture, detailed facial lighting, and lifelike fabric and color accuracy.' The description must integrate all 16 conceptual aspects (Subject; Pose/Gesture; Facial Features/Expression; Clothing/Accessories; Lighting; Mood/Emotion; Color Palette & Tone; Composition & Framing; Environment/Background; Camera Specs; Texture & Detail Focus; Artistic Style; Quality Tags; Narrative/Story Hint; Aesthetic Reference; Custom Directive). Emphasize precision in describing clothing materials, color tones, folds, reflections, and fit, as well as eyewear design, frame shape, lens color, and light reflections on glass. Capture lighting with exact direction, warmth, contrast, and how it interacts with facial features and clothing textures. Highlight expert lighting balance, rich color accuracy, realistic fabric behavior, and cinematic depth. Write it as a single, elegant paragraph — not a list, not numbered, not in JSON. SAFETY RULES: Do NOT specify age, gender, or permanent facial traits. Focus on expression, lighting precision, and material realism. Generate the ready-to-use cinematic prompt based on this image:"
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

  async generateThumbnailPrompt(description: string, language: string, type: 'YouTube Thumbnail' | 'Instagram Cover' = 'YouTube Thumbnail', visualDescription?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const visualHint = visualDescription
      ? `\nAdditional Visual Requirements: ${visualDescription}\nUse these requirements to guide the visual style, composition, and elements.`
      : '';

    const systemPrompt = type === 'Instagram Cover'
      ? `You are a professional visual prompt engineer specializing in Instagram Reels covers and Story aesthetics.
Your task is to generate a high-converting, visually stunning image prompt for an Instagram Cover (9:16 vertical aspect ratio).
KEY REQUIREMENTS:
1. COMPOSITION: Vertical 9:16 format. Center the main subject to ensure visibility in the 1:1 grid crop. Leave space at the top and bottom for UI elements.
2. AESTHETIC: Modern, trendy, high-quality, cinematic lighting, and visually arresting. "Stop the scroll" quality. Use vibrant colors or striking minimalism.
3. STYLE: Avoid cluttered YouTube-style designs. Go for editorial, clean, or highly stylized visuals.
4. TEXT: If text is needed, keep it minimal, bold, and legible in the center. Text language must be: ${language}.
5. OUTPUT: A detailed, descriptive prompt for an AI image generator. Output ONLY the prompt text.`
      : `You are a professional YouTube Thumbnail Designer & CTR Strategist.
Your task is to generate a high-converting, viral-ready image prompt for a YouTube Thumbnail (16:9 landscape aspect ratio).
KEY REQUIREMENTS:
1. COMPOSITION: Landscape 16:9 format. Use the "Rule of Thirds". Ensure the main subject is large and clear, ideally on the right or left to leave space for text.
2. AESTHETIC: High contrast, vibrant/saturated colors, and sharp details. The image must "pop" on both small mobile screens and desktops.
3. EMOTION & STORY: If a person is present, emphasize expressive facial features (shock, joy, curiosity). Create a "curiosity gap" that makes viewers want to click.
4. CLARITY: clear separation between foreground and background. Avoid visual clutter.
5. TEXT: If text is needed, specify it as BIG, BOLD, and HIGH CONTRAST. Text language must be: ${language}.
6. OUTPUT: A detailed, descriptive prompt for an AI image generator. Output ONLY the prompt text.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Description: ${description}\nTarget Language: ${language}${visualHint}\n\nGenerate a prompt for a ${type}.`
                }
              ]
            }
          ],
          max_tokens: 500
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

      return content.trim();

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`OpenAI API error: ${message}`);
      }
      throw error;
    }
  }
}
