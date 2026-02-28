export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          key: string
          label: string
        }
        Insert: {
          color?: string | null
          key: string
          label: string
        }
        Update: {
          color?: string | null
          key?: string
          label?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          competitive_position: Json | null
          created_at: string
          current_price: number | null
          dependency_count: number
          description: string | null
          earnings: number | null
          gross_margin: number | null
          id: string
          market_cap: number | null
          name: string
          pe_ratio: number | null
          revenue: number | null
          risk_score: number
          ticker: string
          updated_at: string
        }
        Insert: {
          competitive_position?: Json | null
          created_at?: string
          current_price?: number | null
          dependency_count?: number
          description?: string | null
          earnings?: number | null
          gross_margin?: number | null
          id: string
          market_cap?: number | null
          name: string
          pe_ratio?: number | null
          revenue?: number | null
          risk_score?: number
          ticker: string
          updated_at?: string
        }
        Update: {
          competitive_position?: Json | null
          created_at?: string
          current_price?: number | null
          dependency_count?: number
          description?: string | null
          earnings?: number | null
          gross_margin?: number | null
          id?: string
          market_cap?: number | null
          name?: string
          pe_ratio?: number | null
          revenue?: number | null
          risk_score?: number
          ticker?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_categories: {
        Row: {
          category_key: string
          company_id: string
        }
        Insert: {
          category_key: string
          company_id: string
        }
        Update: {
          category_key?: string
          company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_categories_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_scores: {
        Row: {
          beneficiary_score: number
          bottleneck_score: number
          breakdown: Json | null
          company_id: string
          computed_at: string
        }
        Insert: {
          beneficiary_score?: number
          bottleneck_score?: number
          breakdown?: Json | null
          company_id: string
          computed_at?: string
        }
        Update: {
          beneficiary_score?: number
          bottleneck_score?: number
          breakdown?: Json | null
          company_id?: string
          computed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          confidence: number
          from_company_id: string
          id: string
          last_seen: string
          notes: string | null
          rel_type: string
          source: string | null
          to_company_id: string
        }
        Insert: {
          confidence?: number
          from_company_id: string
          id?: string
          last_seen?: string
          notes?: string | null
          rel_type: string
          source?: string | null
          to_company_id: string
        }
        Update: {
          confidence?: number
          from_company_id?: string
          id?: string
          last_seen?: string
          notes?: string | null
          rel_type?: string
          source?: string | null
          to_company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_from_company_id_fkey"
            columns: ["from_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_to_company_id_fkey"
            columns: ["to_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_runs: {
        Row: {
          companies_scanned: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          relationships_found: number | null
          signals_found: number | null
          started_at: string
          status: string
          trigger_type: string
        }
        Insert: {
          companies_scanned?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          relationships_found?: number | null
          signals_found?: number | null
          started_at?: string
          status?: string
          trigger_type?: string
        }
        Update: {
          companies_scanned?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          relationships_found?: number | null
          signals_found?: number | null
          started_at?: string
          status?: string
          trigger_type?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          as_of: string
          company_id: string
          created_at: string
          direction: string
          id: string
          magnitude: number | null
          signal_type: string
          source: string | null
          summary: string | null
        }
        Insert: {
          as_of?: string
          company_id: string
          created_at?: string
          direction: string
          id?: string
          magnitude?: number | null
          signal_type: string
          source?: string | null
          summary?: string | null
        }
        Update: {
          as_of?: string
          company_id?: string
          created_at?: string
          direction?: string
          id?: string
          magnitude?: number | null
          signal_type?: string
          source?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
