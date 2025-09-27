
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getAngleInstruction = (angle: string): string => {
    switch(angle) {
        case 'Top-Down View':
            return 'Re-compose the shot from a top-down (flat lay) perspective, looking directly down onto the dish.';
        case '45-Degree Angle':
            return 'Re-compose the shot from a 45-degree angle, showing both the top and side of the dish to create a sense of depth. This is a classic food photography angle.';
        case 'Eye-Level View':
            return 'Re-compose the shot from an eye-level or straight-on perspective, as if you are sitting at the table looking at the dish.';
        default:
            return 'Use the classic 45-degree angle food photography shot.'; 
    }
}

export async function enhanceImage(
  base64ImageData: string,
  mimeType: string,
  userPrompt: string,
  cameraAngle: string
): Promise<string> {
  const model = 'gemini-2.5-flash-image-preview';
  
  const angleInstruction = getAngleInstruction(cameraAngle);

  // If there's no user prompt, provide a default to ensure a high-quality result.
  const stylePrompt = userPrompt || 'Professional studio food photography, clean and appetizing.';

  const fullPrompt = `
    ROLE: AI Art Director for professional food photography.

    TASK: Recreate the user's uploaded photo. Your job is to synthesize all elements of the following 'Shot Brief' into a single, cohesive, hyper-realistic final image.

    --- SHOT BRIEF ---
    1.  SUBJECT: The food item in the original photo. **Crucial: Do NOT change the food itself.** The dish must remain the same.
    2.  CAMERA ANGLE: ${angleInstruction}
    3.  STYLE & MOOD: ${stylePrompt}
    --------------------

    EXECUTION GUIDELINES:
    -   **SYNTHESIZE:** The lighting, composition, background, and props must all work together to perfectly match the requested CAMERA ANGLE and STYLE & MOOD. For example, a 'Cinematic' style from a 'Top-Down View' requires different lighting and shadow considerations than an 'Eye-Level' shot.
    -   **PHOTOREALISM:** The output MUST look like a real photo from a high-end DSLR camera. Avoid any "AI" or "digital" look. Focus on realistic textures, reflections, and shadows.
    -   **LIGHTING:** Use professional lighting techniques (e.g., softbox, directional light, subtle rim light) that are appropriate for the brief to create depth and an appetizing look.
    -   **COMPOSITION:** Re-compose the shot based on the brief. Use shallow depth of field (bokeh) to make the subject pop. Ensure the focus is sharp on the most delicious part of the dish.
    -   **CLEAN OUTPUT:** Do NOT add text, watermarks, or logos. Output ONLY the final, edited image.
  `;

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: fullPrompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error('No image was generated in the response.');

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('The AI failed to process the image. Please try again.');
  }
}

export async function addTextToImage(
    base64ImageData: string,
    mimeType: string,
    headline: string,
    details: string,
    style: string
): Promise<string> {
    const model = 'gemini-2.5-flash-image-preview';

    const fullPrompt = `
      ROLE: AI Graphic Designer.

      TASK: Add promotional text to the provided image. **Crucially: DO NOT alter the underlying image of the food in any way.** You are only adding text elements on top of it.

      --- TEXT CONTENT ---
      - Headline: "${headline}"
      - Details: "${details}"
      --------------------

      --- DESIGN BRIEF ---
      - Style: "${style}"
      --------------------

      EXECUTION GUIDELINES:
      -   **Intelligent Placement:** Analyze the image composition and place the text in a visually appealing area, such as negative space. Avoid covering the main subject (the food).
      -   **Legibility:** Ensure the text is highly readable. Use colors, fonts, and effects (like drop shadows or outlines) that contrast well with the background.
      -   **Adherence to Style:** Strictly follow the design brief for the text's style.
      -   **Clean Output:** Do not add any extra elements, watermarks, or logos. Output ONLY the final image with the text applied.
    `;

    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: fullPrompt,
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        
        throw new Error('No image was generated in the response.');

    } catch (error) {
        console.error('Error calling Gemini API for text addition:', error);
        throw new Error('The AI failed to add text to the image. Please try again.');
    }
}
