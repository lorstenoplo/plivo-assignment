import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ContentHistoryService } from "@/lib/content-history";

interface ImageAnalysisResult {
  description: string;
  detailedDescription: string;
  objects: string[];
  colors: string[];
  mood: string;
  style: string;
  people: {
    count: number;
    details: string[];
  };
  location: string;
  timeOfDay: string;
  textContent: string;
  technicalDetails: {
    composition: string;
    lighting: string;
    quality: string;
  };
  tags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { imageData, mimeType } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Using Gemini 2.5 Flash as requested (free tier)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare the image data for Gemini
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };

    const prompt = `
Analyze this image in detail and provide a comprehensive analysis. Please return your response in the following JSON format:

{
  "description": "A clear, concise description of what you see in the image",
  "detailedDescription": "A more detailed and nuanced description of the image, including context, emotions, and artistic elements",
  "objects": ["object1", "object2", "object3"],
  "colors": ["color1", "color2", "color3"],
  "mood": "The overall mood or atmosphere of the image",
  "style": "The artistic style, photography style, or visual style",
  "people": {
    "count": 0,
    "details": ["Description of each person if any are present"]
  },
  "location": "Likely location or setting type",
  "timeOfDay": "Time of day if discernible",
  "textContent": "Any text visible in the image (OCR)",
  "technicalDetails": {
    "composition": "Description of the composition and framing",
    "lighting": "Description of lighting conditions and quality",
    "quality": "Assessment of image quality, resolution, clarity"
  },
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Instructions:
1. Provide a brief but informative description (1-2 sentences)
2. Give a detailed description that captures the essence, mood, and artistic qualities
3. List all significant objects you can identify in the image
4. Identify the main colors present in the image
5. Determine the overall mood/atmosphere (e.g., peaceful, energetic, melancholic, etc.)
6. Identify the style (e.g., portrait, landscape, street photography, digital art, etc.)
7. Count people and describe them if present
8. Identify the likely location or setting
9. Determine time of day if possible from lighting/context
10. Extract any visible text using OCR capabilities
11. Analyze technical aspects like composition, lighting, and quality
12. Provide 5-7 relevant tags for categorization

Please ensure the JSON is valid and properly formatted. Be descriptive but concise.
`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let analysisResult: ImageAnalysisResult;
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // Fallback: create a basic structure if JSON parsing fails
      console.error("Failed to parse Gemini response:", parseError);

      analysisResult = {
        description: text.slice(0, 200) + "...",
        detailedDescription: text,
        objects: ["Unknown"],
        colors: ["Mixed"],
        mood: "Neutral",
        style: "Photography",
        people: {
          count: 0,
          details: [],
        },
        location: "Unknown",
        timeOfDay: "Unknown",
        textContent: "",
        technicalDetails: {
          composition: "Standard composition",
          lighting: "Natural lighting",
          quality: "Good quality",
        },
        tags: ["general", "image", "analysis"],
      };
    }

    // Save to content history
    try {
      await ContentHistoryService.saveToHistory({
        content_type: "image",
        input_data: {
          prompt: "Image analysis",
        },
        output_data: JSON.stringify(analysisResult),
      });
    } catch (historyError) {
      console.error("Failed to save to history:", historyError);
      // Don't fail the main request if history saving fails
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
