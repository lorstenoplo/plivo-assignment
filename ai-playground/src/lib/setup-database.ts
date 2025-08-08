import { createClient } from "@/utils/supabase/server";

export async function createContentHistoryTable() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("create_content_history_table");

  if (error) {
    console.error("Error creating content_history table:", error);
    return false;
  }

  console.log("Content history table created successfully!");
  return true;
}

// You can call this function once to set up the table
// createContentHistoryTable();
