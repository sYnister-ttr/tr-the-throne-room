export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dclone_status: {
        Row: {
          created_at: string | null
          id: string
          progress: string
          region: string
          status: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          progress: string
          region: string
          status: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          progress?: string
          region?: string
          status?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          base_type: string | null
          category: string
          created_at: string
          description: string | null
          game: string
          id: string
          image_url: string | null
          name: string
          rarity: string
          required_level: number
          stats: string[]
          updated_at: string
        }
        Insert: {
          base_type?: string | null
          category: string
          created_at?: string
          description?: string | null
          game: string
          id?: string
          image_url?: string | null
          name: string
          rarity: string
          required_level?: number
          stats?: string[]
          updated_at?: string
        }
        Update: {
          base_type?: string | null
          category?: string
          created_at?: string
          description?: string | null
          game?: string
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string
          required_level?: number
          stats?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      price_check_responses: {
        Row: {
          comment: string | null
          created_at: string
          estimated_price: number | null
          id: string
          items_offered: string | null
          payment_type: string
          price_check_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          items_offered?: string | null
          payment_type?: string
          price_check_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          items_offered?: string | null
          payment_type?: string
          price_check_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_check_responses_price_check_id_fkey"
            columns: ["price_check_id"]
            isOneToOne: false
            referencedRelation: "price_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      price_checks: {
        Row: {
          created_at: string
          description: string | null
          game: Database["public"]["Enums"]["game_type"]
          game_mode: Database["public"]["Enums"]["game_mode_type"]
          id: string
          item_name: string
          ladder_status: Database["public"]["Enums"]["ladder_type"]
          platform: Database["public"]["Enums"]["platform_type"]
          responses_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          game: Database["public"]["Enums"]["game_type"]
          game_mode?: Database["public"]["Enums"]["game_mode_type"]
          id?: string
          item_name: string
          ladder_status: Database["public"]["Enums"]["ladder_type"]
          platform: Database["public"]["Enums"]["platform_type"]
          responses_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          game?: Database["public"]["Enums"]["game_type"]
          game_mode?: Database["public"]["Enums"]["game_mode_type"]
          id?: string
          item_name?: string
          ladder_status?: Database["public"]["Enums"]["ladder_type"]
          platform?: Database["public"]["Enums"]["platform_type"]
          responses_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_price_checks_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      runewords: {
        Row: {
          base_types: string[]
          created_at: string
          fixed_stats: string[]
          game: string
          id: string
          name: string
          required_level: number
          runes: string[]
          updated_at: string
          variable_stats: Json
        }
        Insert: {
          base_types: string[]
          created_at?: string
          fixed_stats?: string[]
          game: string
          id?: string
          name: string
          required_level?: number
          runes: string[]
          updated_at?: string
          variable_stats?: Json
        }
        Update: {
          base_types?: string[]
          created_at?: string
          fixed_stats?: string[]
          game?: string
          id?: string
          name?: string
          required_level?: number
          runes?: string[]
          updated_at?: string
          variable_stats?: Json
        }
        Relationships: []
      }
      terror_zones: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          server: string
          zone_name: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          server: string
          zone_name: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          server?: string
          zone_name?: string
        }
        Relationships: []
      }
      trade_offers: {
        Row: {
          created_at: string
          id: string
          items_offered: string | null
          offer_details: string
          payment_type: string
          price_offered: number | null
          status: string | null
          trade_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items_offered?: string | null
          offer_details: string
          payment_type?: string
          price_offered?: number | null
          status?: string | null
          trade_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items_offered?: string | null
          offer_details?: string
          payment_type?: string
          price_offered?: number | null
          status?: string | null
          trade_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_offers_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string
          description: string
          game: Database["public"]["Enums"]["game_type"]
          game_mode: Database["public"]["Enums"]["game_mode_type"]
          id: string
          ladder_status: Database["public"]["Enums"]["ladder_type"]
          payment_items: string | null
          payment_type: string
          platform: Database["public"]["Enums"]["platform_type"]
          price: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          game: Database["public"]["Enums"]["game_type"]
          game_mode: Database["public"]["Enums"]["game_mode_type"]
          id?: string
          ladder_status: Database["public"]["Enums"]["ladder_type"]
          payment_items?: string | null
          payment_type?: string
          platform: Database["public"]["Enums"]["platform_type"]
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          game?: Database["public"]["Enums"]["game_type"]
          game_mode?: Database["public"]["Enums"]["game_mode_type"]
          id?: string
          ladder_status?: Database["public"]["Enums"]["ladder_type"]
          payment_items?: string | null
          payment_type?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
    }
    Enums: {
      game_mode_type: "softcore" | "hardcore" | "eternal" | "seasonal"
      game_type: "diablo2_resurrected" | "diablo4"
      ladder_type: "ladder" | "non_ladder" | "not_applicable"
      platform_type: "pc" | "playstation" | "xbox" | "nintendo_switch"
      user_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
