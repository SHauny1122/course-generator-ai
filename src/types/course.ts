export interface Course {
  id: string;
  user_id: string;
  title: string;
  content: string;
  lessons: Record<string, any>;
  shared: boolean;
  share_url?: string;
  created_at: string;
  updated_at: string;
}
