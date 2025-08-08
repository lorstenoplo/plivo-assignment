import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Speaker {
  id: string;
  label: string;
  segments: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

interface AnalysisResult {
  transcript: string;
  speakers: Speaker[];
  summary: string;
  keyTopics: string[];
  sentiment: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const { audioData, mimeType } = await request.json();

    if (!audioData) {
      return NextResponse.json(
        { error: "No audio data provided" },
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare the audio data for Gemini
    const audioPart = {
      inlineData: {
        data: audioData,
        mimeType: mimeType,
      },
    };

    const prompt = `
Analyze this audio file and provide a comprehensive conversation analysis. Please return your response in the following JSON format:

{
  "transcript": "Full transcript of the conversation",
  "speakers": [
    {
      "id": "speaker_1",
      "label": "Speaker 1", 
      "segments": [
        {
          "text": "What the speaker said",
          "startTime": 0,
          "endTime": 5
        }
      ]
    }
  ],
  "summary": "Brief summary of the conversation",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "sentiment": "Positive/Negative/Neutral",
  "duration": 120
}

Instructions:
1. Transcribe the entire audio accurately
2. Identify up to 2 speakers and separate their speech segments
3. Assign approximate timestamps for each segment (in seconds)
4. Provide a concise summary of the main discussion points
5. Extract 3-5 key topics discussed
6. Determine the overall sentiment of the conversation
7. Estimate the total duration of the audio

Please ensure the JSON is valid and properly formatted. If there's only one speaker, still format as an array with one speaker object.
`;

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let analysisResult: AnalysisResult;
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
        transcript: text,
        speakers: [
          {
            id: "speaker_1",
            label: "Speaker 1",
            segments: [
              {
                text: text,
                startTime: 0,
                endTime: 60,
              },
            ],
          },
        ],
        summary:
          "Audio analysis completed. Please check the transcript for details.",
        keyTopics: ["General discussion"],
        sentiment: "Neutral",
        duration: 60,
      };
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
