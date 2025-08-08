export interface ContentHistory {
  id: string;
  user_id: string;
  content_type: "conversation" | "image" | "document" | "url";
  input_data: {
    prompt?: string;
    url?: string;
    messages?: Array<{ role: string; content: string }>;
  };
  output_data: string;
  file_info?: {
    name: string;
    type: string;
    size?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateContentHistoryInput {
  content_type: ContentHistory["content_type"];
  input_data: ContentHistory["input_data"];
  output_data: string;
  file_info?: ContentHistory["file_info"];
}

export interface ContentHistoryResponse {
  data: ContentHistory[];
  count: number;
  hasMore: boolean;
}
