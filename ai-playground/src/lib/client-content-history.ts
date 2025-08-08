import { createClient } from "@/utils/supabase/client";
import { ContentHistory, ContentHistoryResponse } from "@/types/history";

export class ClientContentHistoryService {
  /**
   * Get user's content generation history from client side
   */
  static async getHistory(
    limit: number = 10,
    contentType?: ContentHistory["content_type"]
  ): Promise<ContentHistoryResponse> {
    try {
      const supabase = createClient();

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
   * Delete a specific history entry from client side
   */
  static async deleteHistoryItem(historyId: string): Promise<boolean> {
    try {
      const supabase = createClient();

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
   * Clear all history for the current user from client side
   */
  static async clearAllHistory(): Promise<boolean> {
    try {
      const supabase = createClient();

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
}
