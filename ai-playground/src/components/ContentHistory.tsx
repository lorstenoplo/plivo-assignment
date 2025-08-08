"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Clock,
  FileText,
  MessageSquare,
  ImageIcon,
  Globe,
  RefreshCw,
} from "lucide-react";
import { ContentHistory } from "@/types/history";
import { ClientContentHistoryService } from "@/lib/client-content-history";
import { formatDistanceToNow } from "date-fns";

interface ContentHistoryComponentProps {
  contentType?: ContentHistory["content_type"];
  onSelectHistory?: (history: ContentHistory) => void;
  className?: string;
}

export function ContentHistoryComponent({
  contentType,
  onSelectHistory,
  className = "",
}: ContentHistoryComponentProps) {
  const [history, setHistory] = useState<ContentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClientContentHistoryService.getHistory(
        10,
        contentType
      );
      setHistory(response.data);
    } catch (err) {
      setError("Failed to load history");
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDeleteItem = async (historyId: string) => {
    try {
      const success = await ClientContentHistoryService.deleteHistoryItem(
        historyId
      );
      if (success) {
        setHistory((prev) => prev.filter((item) => item.id !== historyId));
      } else {
        setError("Failed to delete history item");
      }
    } catch (err) {
      setError("Failed to delete history item");
      console.error("Error deleting history item:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      const success = await ClientContentHistoryService.clearAllHistory();
      if (success) {
        setHistory([]);
      } else {
        setError("Failed to clear history");
      }
    } catch (err) {
      setError("Failed to clear history");
      console.error("Error clearing history:", err);
    }
  };

  const getContentTypeIcon = (type: ContentHistory["content_type"]) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "url":
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: ContentHistory["content_type"]) => {
    switch (type) {
      case "conversation":
        return "bg-blue-100 text-blue-800";
      case "image":
        return "bg-purple-100 text-purple-800";
      case "document":
        return "bg-green-100 text-green-800";
      case "url":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatInputData = (history: ContentHistory) => {
    const { input_data, file_info } = history;

    if (file_info) {
      return `File: ${file_info.name} (${file_info.type})`;
    }

    if (input_data.url) {
      return `URL: ${input_data.url}`;
    }

    if (input_data.prompt) {
      return input_data.prompt;
    }

    if (input_data.messages && input_data.messages.length > 0) {
      const lastMessage = input_data.messages[input_data.messages.length - 1];
      return lastMessage.content;
    }

    return "No input data";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            History ({history.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {history.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No history found</p>
            <p className="text-sm">Your past generations will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectHistory?.(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className={`${getContentTypeColor(
                        item.content_type
                      )} flex items-center gap-1`}
                    >
                      {getContentTypeIcon(item.content_type)}
                      {item.content_type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="text-xs font-medium text-gray-600">
                        Input:
                      </span>
                      <p className="text-sm text-gray-800">
                        {truncateText(formatInputData(item))}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-gray-600">
                        Output:
                      </span>
                      <p className="text-sm text-gray-800">
                        {truncateText(item.output_data, 100)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
