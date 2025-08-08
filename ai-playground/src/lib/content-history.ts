import { createClient } from "@/utils/supabase/server";
import {
  ContentHistory,
  CreateContentHistoryInput,
  ContentHistoryResponse,
} from "@/types/history";

export class ContentHistoryService {
  /**
   * Save a new content generation to history
   */
  static async saveToHistory(
    input: CreateContentHistoryInput
  ): Promise<ContentHistory | null> {
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User not authenticated:", userError);
        return null;
      }

      const { data, error } = await supabase
        .from("content_history")
        .insert({
          user_id: user.id,
          content_type: input.content_type,
          input_data: input.input_data,
          output_data: input.output_data,
          file_info: input.file_info || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving to history:", error);
        return null;
      }

      return data as ContentHistory;
    } catch (error) {
      console.error("Error in saveToHistory:", error);
      return null;
    }
  }

  /**
   * Get user's content generation history (latest 10 by default)
   */
  static async getHistory(
    limit: number = 10,
    contentType?: ContentHistory["content_type"]
  ): Promise<ContentHistoryResponse> {
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User not authenticated:", userError);
        return { data: [], count: 0, hasMore: false };
      }

      let query = supabase
        .from("content_history")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (contentType) {
        query = query.eq("content_type", contentType);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching history:", error);
        return { data: [], count: 0, hasMore: false };
      }

      return {
        data: (data || []) as ContentHistory[],
        count: count || 0,
        hasMore: (count || 0) > limit,
      };
    } catch (error) {
      console.error("Error in getHistory:", error);
      return { data: [], count: 0, hasMore: false };
    }
  }

  /**
   * Delete a specific history entry
   */
  static async deleteHistoryItem(historyId: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("id", historyId);

      if (error) {
        console.error("Error deleting history item:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteHistoryItem:", error);
      return false;
    }
  }

  /**
   * Clear all history for the current user
   */
  static async clearAllHistory(): Promise<boolean> {
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User not authenticated:", userError);
        return false;
      }

      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error clearing history:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in clearAllHistory:", error);
      return false;
    }
  }

  /**
   * Get formatted file info for display
   */
  static formatFileInfo(fileInfo?: ContentHistory["file_info"]): string {
    if (!fileInfo) return "";

    const { name, type, size } = fileInfo;
    let result = `${name} (${type})`;

    if (size) {
      const sizeInMB = (size / (1024 * 1024)).toFixed(2);
      result += ` - ${sizeInMB}MB`;
    }

    return result;
  }

  /**
   * Truncate text for display
   */
  static truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
}
