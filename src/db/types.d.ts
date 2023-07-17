export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      predictions: {
        Row: {
          author_id: string
          correct: boolean
          created_at: string
          message_id: string
          prediction: number
        }
        Insert: {
          author_id: string
          correct?: boolean
          created_at?: string
          message_id: string
          prediction: number
        }
        Update: {
          author_id?: string
          correct?: boolean
          created_at?: string
          message_id?: string
          prediction?: number
        }
      }
      tags: {
        Row: {
          author_id: string
          id: number
          tag_content: string
          tag_name: string
        }
        Insert: {
          author_id: string
          id?: number
          tag_content: string
          tag_name: string
        }
        Update: {
          author_id?: string
          id?: number
          tag_content?: string
          tag_name?: string
        }
      }
      thread_solves: {
        Row: {
          count: number
          user_id: string
        }
        Insert: {
          count?: number
          user_id: string
        }
        Update: {
          count?: number
          user_id?: string
        }
      }
      threadlord_blacklist: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          count: number | null
          user_id: string | null
        }
      }
    }
    Functions: {
      get_tags_list: {
        Args: {
          page_number: number
        }
        Returns: {
          tag_name: string
          author_id: string
        }[]
      }
      increment_solve_count: {
        Args: {
          solver_id: string
        }
        Returns: undefined
      }
      matching_tags: {
        Args: {
          to_search: string
        }
        Returns: {
          tag_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
