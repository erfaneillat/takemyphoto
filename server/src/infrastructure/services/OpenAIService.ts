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
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image and provide:
1. A detailed, creative prompt that could be used to generate this image using AI (be specific about style, colors, composition, mood, lighting, and key elements)
2. A list of the main visual elements you detect

Format your response as JSON with two fields:
- "prompt": A detailed creative prompt (2-3 sentences)
- "detectedElements": An array of key visual elements detected

Be creative and descriptive in the prompt, but accurate to what you see.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${request.mimeType};base64,${request.imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.7
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

      // Try to parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            prompt: parsed.prompt || content,
            detectedElements: parsed.detectedElements || []
          };
        }
      } catch (parseError) {
        // If JSON parsing fails, use the raw content as prompt
        console.warn('Could not parse JSON from OpenAI response, using raw content');
      }

      // Fallback: return raw content as prompt
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
