import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import { ContentHistoryService } from "@/lib/content-history";

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
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    let extractedContent = "";
    let pageTitle = "";
    let author = "";
    let publishDate = "";
    const structureInfo = {
      sections: 0,
      tables: 0,
      images: 0,
      links: 0,
    };

    try {
      // Fetch the webpage
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch URL: ${response.status} ${response.statusText}`
        );
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract title
      pageTitle =
        $("title").text().trim() ||
        $("h1").first().text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        "Web Page Analysis";

      // Extract author
      author =
        $('meta[name="author"]').attr("content") ||
        $('meta[property="article:author"]').attr("content") ||
        $(".author").first().text().trim() ||
        "";

      // Extract publish date
      publishDate =
        $('meta[property="article:published_time"]').attr("content") ||
        $('meta[name="date"]').attr("content") ||
        $("time").first().attr("datetime") ||
        $(".date").first().text().trim() ||
        "";

      // Remove script, style, nav, footer, and other non-content elements
      $(
        "script, style, nav, footer, header, .nav, .navigation, .sidebar, .advertisement, .ads"
      ).remove();

      // Extract main content - try multiple selectors
      let content = "";
      const contentSelectors = [
        "article",
        ".article-content",
        ".post-content",
        ".entry-content",
        ".content",
        "main",
        ".main-content",
        "#content",
        ".story-body",
        ".article-body",
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length && element.text().trim().length > content.length) {
          content = element.text().trim();
        }
      }

      // If no specific content area found, get body text
      if (!content || content.length < 200) {
        content = $("body").text().trim();
      }

      // Clean up the content
      extractedContent = content
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      // Analyze structure
      structureInfo.sections = $("h1, h2, h3, h4, h5, h6").length;
      structureInfo.tables = $("table").length;
      structureInfo.images = $("img").length;
      structureInfo.links = $("a[href]").length;

      // More flexible content validation - check for meaningful content
      if (!extractedContent || extractedContent.length < 50) {
        // Try alternative extraction methods
        const fallbackContent =
          $("p")
            .map((i, el) => $(el).text().trim())
            .get()
            .join(" ") ||
          $("div")
            .map((i, el) => $(el).text().trim())
            .get()
            .slice(0, 10)
            .join(" ") ||
          $("span")
            .map((i, el) => $(el).text().trim())
            .get()
            .slice(0, 20)
            .join(" ");

        if (fallbackContent && fallbackContent.length > 20) {
          extractedContent = fallbackContent.trim();
        } else {
          // Even if content is minimal, let's try to analyze what we have
          extractedContent =
            pageTitle || url || "Limited content available for analysis";
        }
      }
    } catch (fetchError) {
      console.error("URL fetching error:", fetchError);

      // Instead of failing completely, let's try to analyze the URL itself
      // This provides a better user experience
      const fallbackContent = `Analysis of ${url}: Unable to fully extract webpage content. This might be due to JavaScript-heavy content, access restrictions, or site blocking. The URL appears to be: ${url}`;

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
Analyze this URL and provide a basic summary based on the URL structure and any available information. Please return your response in the following JSON format:

{
  "title": "Analysis of ${url}",
  "summary": "Unable to extract full webpage content. This might be due to JavaScript-heavy content, access restrictions, or the site blocking automated requests.",
  "detailedSummary": "The analysis was limited due to content extraction issues. The URL suggests it may contain relevant information, but full content analysis was not possible.",
  "keyPoints": ["Content extraction was limited", "Site may use JavaScript rendering", "Manual review recommended"],
  "topics": ["Web analysis limitation", "Content accessibility"],
  "wordCount": 50,
  "readingTime": 1,
  "sentiment": "Neutral",
  "difficulty": "Unknown",
  "structure": {
    "sections": 0,
    "tables": 0,
    "images": 0,
    "links": 0
  },
  "metadata": {
    "language": "Unknown",
    "source": "URL Analysis (Limited)"
  },
  "quotes": [],
  "actionItems": ["Consider accessing the URL manually for full content", "Check if the site allows automated access"]
}

URL to analyze: ${url}
Available information: ${fallbackContent}

Please provide a helpful analysis acknowledging the limitations while still giving useful feedback to the user.
`;

      try {
        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();

        let analysisResult;
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found in response");
          }
        } catch {
          analysisResult = {
            title: `Analysis of ${url}`,
            summary:
              "Unable to extract webpage content due to technical limitations.",
            detailedSummary:
              "The URL could not be fully analyzed due to content extraction issues. This is common with JavaScript-heavy sites or sites that block automated requests.",
            keyPoints: [
              "Content extraction failed",
              "Site may use dynamic content loading",
              "Manual review recommended",
            ],
            topics: ["Web accessibility", "Content extraction limitations"],
            wordCount: 0,
            readingTime: 1,
            sentiment: "Neutral",
            difficulty: "Unknown",
            structure: { sections: 0, tables: 0, images: 0, links: 0 },
            metadata: { language: "Unknown", source: "URL Analysis (Limited)" },
            quotes: [],
            actionItems: [
              "Try accessing the URL manually",
              "Check if the site has an API or RSS feed",
            ],
          };
        }

        return NextResponse.json(analysisResult);
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        return NextResponse.json(
          {
            error:
              "Failed to analyze the webpage. The site may not be accessible or may block automated requests.",
          },
          { status: 400 }
        );
      }
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Analyze this webpage content and provide a comprehensive summary and analysis. Please return your response in the following JSON format:

{
  "title": "${pageTitle}",
  "summary": "A concise 2-3 sentence summary of the main content",
  "detailedSummary": "A more comprehensive summary (4-6 sentences) covering key themes and insights",
  "keyPoints": ["List of 5-8 most important points from the content"],
  "topics": ["List of 4-6 main topics or themes discussed"],
  "wordCount": ${extractedContent.split(" ").length},
  "readingTime": ${Math.ceil(extractedContent.split(" ").length / 200)},
  "sentiment": "Overall sentiment: Positive/Negative/Neutral/Mixed",
  "difficulty": "Reading difficulty: Beginner/Intermediate/Advanced/Expert",
  "structure": {
    "sections": ${structureInfo.sections},
    "tables": ${structureInfo.tables},
    "images": ${structureInfo.images},
    "links": ${structureInfo.links}
  },
  "metadata": {
    "author": ${author ? `"${author}"` : "null"},
    "publishDate": ${publishDate ? `"${publishDate}"` : "null"},
    "language": "Primary language of the content",
    "source": "Web Article"
  },
  "quotes": ["Array of 2-3 most important or memorable quotes from the text"],
  "actionItems": ["List of actionable items or recommendations if any are present"]
}

Webpage Content:
${extractedContent.substring(0, 50000)} ${
      extractedContent.length > 50000
        ? "...[content truncated for analysis]"
        : ""
    }

Instructions:
1. Use the provided title or improve it if needed
2. Provide both concise and detailed summaries
3. Extract the most important points and themes
4. Analyze the content structure and complexity
5. Identify key quotes that represent important ideas
6. Extract any actionable items or recommendations
7. Estimate reading difficulty based on vocabulary and concepts
8. Determine sentiment and overall tone
9. Use provided metadata where available
10. Ensure all arrays contain relevant, non-duplicate items

Please ensure the JSON is valid and properly formatted.
`;

    const result = await model.generateContent([prompt]);
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
    } catch {
      console.error("Failed to parse Gemini response");

      // Fallback: create a basic structure if JSON parsing fails
      const wordCount = extractedContent.split(" ").length;
      analysisResult = {
        title: pageTitle || "Web Page Analysis",
        summary: extractedContent.substring(0, 300) + "...",
        detailedSummary: extractedContent.substring(0, 800) + "...",
        keyPoints: [
          "Web content analysis completed",
          "Please review the content manually",
        ],
        topics: ["Web content", "Online article"],
        wordCount: wordCount,
        readingTime: Math.ceil(wordCount / 200),
        sentiment: "Neutral",
        difficulty: "Intermediate",
        structure: structureInfo,
        metadata: {
          author: author || undefined,
          publishDate: publishDate || undefined,
          language: "English",
          source: "Web Article",
        },
        quotes: [],
        actionItems: [],
        fullText: extractedContent.substring(0, 2000),
      };
    }

    // Save to content history
    try {
      await ContentHistoryService.saveToHistory({
        content_type: "url",
        input_data: {
          url: url,
        },
        output_data: JSON.stringify(analysisResult),
      });
    } catch (historyError) {
      console.error("Failed to save to history:", historyError);
      // Don't fail the main request if history saving fails
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return NextResponse.json(
      { error: "Failed to analyze URL" },
      { status: 500 }
    );
  }
}
