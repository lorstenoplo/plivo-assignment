import { NextRequest, NextResponse } from "next/server";
import { ContentHistoryService } from "@/lib/content-history";
import { CreateContentHistoryInput } from "@/types/history";

export async function POST(request: NextRequest) {
  try {
    const body: CreateContentHistoryInput = await request.json();

    // Validate required fields
    if (!body.content_type || !body.input_data || !body.output_data) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: content_type, input_data, or output_data",
        },
        { status: 400 }
      );
    }

    // Save to history
    const historyItem = await ContentHistoryService.saveToHistory(body);

    if (!historyItem) {
      return NextResponse.json(
        { error: "Failed to save to history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: historyItem,
    });
  } catch (error) {
    console.error("Error in content history API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("type") as
      | "conversation"
      | "image"
      | "document"
      | "url"
      | null;
    const limit = parseInt(searchParams.get("limit") || "10");

    const history = await ContentHistoryService.getHistory(
      limit,
      contentType || undefined
    );

    return NextResponse.json({
      success: true,
      ...history,
    });
  } catch (error) {
    console.error("Error fetching content history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (!historyId) {
      return NextResponse.json(
        { error: "History ID is required" },
        { status: 400 }
      );
    }

    const success = await ContentHistoryService.deleteHistoryItem(historyId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete history item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
