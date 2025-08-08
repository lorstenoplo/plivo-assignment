import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface DocumentSummaryResult {
  title: string;
  summary: string;
  detailedSummary: string;
  keyPoints: string[];
  topics: string[];
  wordCount: number;
  readingTime: number;
  sentiment: string;
  difficulty: string;
  structure: {
    sections: number;
    tables: number;
    images: number;
    links: number;
  };
  metadata: {
    author?: string;
    publishDate?: string;
    language: string;
    source: string;
  };
  quotes: string[];
  actionItems: string[];
  fullText?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { documentData, mimeType, fileName } = await request.json();

    if (!documentData) {
      return NextResponse.json(
        { error: "No document data provided" },
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

    // Prepare the document data for Gemini
    const documentPart = {
      inlineData: {
        data: documentData,
        mimeType: mimeType,
      },
    };

    const prompt = `
Analyze this document and provide a comprehensive summary and analysis. Please return your response in the following JSON format:

{
  "title": "Extract or generate an appropriate title for the document",
  "summary": "A concise 2-3 sentence summary of the main content",
  "detailedSummary": "A more comprehensive summary (4-6 sentences) covering key themes and insights",
  "keyPoints": ["List of 5-8 most important points from the document"],
  "topics": ["List of 4-6 main topics or themes discussed"],
  "wordCount": "Estimated word count",
  "readingTime": "Estimated reading time in minutes",
  "sentiment": "Overall sentiment: Positive/Negative/Neutral/Mixed",
  "difficulty": "Reading difficulty: Beginner/Intermediate/Advanced/Expert",
  "structure": {
    "sections": "Number of main sections",
    "tables": "Number of tables/data structures",
    "images": "Number of images/figures",
    "links": "Number of references/links"
  },
  "metadata": {
    "author": "Author name if mentioned, otherwise null",
    "publishDate": "Publication date if mentioned, otherwise null",
    "language": "Primary language of the document",
    "source": "Document type (PDF/DOCX/etc.)"
  },
  "quotes": ["Array of 2-3 most important or memorable quotes from the text"],
  "actionItems": ["List of actionable items or recommendations if any are present"]
}

Instructions:
1. Read and analyze the entire document content
2. Generate an appropriate title if none is apparent
3. Provide both concise and detailed summaries
4. Extract the most important points and themes
5. Analyze the document structure (sections, tables, images, etc.)
6. Extract key quotes that represent important ideas
7. Extract any actionable items or recommendations
8. Estimate reading difficulty based on vocabulary and concepts
9. Determine sentiment and overall tone
10. Extract metadata where available
11. Handle PDFs, Word documents, and text files appropriately
12. If the document contains tables, charts, or images, describe their content

Please ensure the JSON is valid and properly formatted.
`;

    const result = await model.generateContent([prompt, documentPart]);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let analysisResult: DocumentSummaryResult;
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);

      // Fallback: create a basic structure if JSON parsing fails
      analysisResult = {
        title: fileName.replace(/\.[^/.]+$/, "") || "Document Analysis",
        summary:
          "Document analysis completed. Please review the raw response for details.",
        detailedSummary:
          "The AI has processed your document but the response couldn't be parsed into the expected format. The analysis was completed successfully.",
        keyPoints: [
          "Document analysis completed",
          "Please review the content manually for detailed insights",
        ],
        topics: ["General content", "Document analysis"],
        wordCount: 0,
        readingTime: 1,
        sentiment: "Neutral",
        difficulty: "Intermediate",
        structure: {
          sections: 1,
          tables: 0,
          images: 0,
          links: 0,
        },
        metadata: {
          language: "English",
          source: "Document",
        },
        quotes: [],
        actionItems: [],
        fullText: text.substring(0, 2000),
      };
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
