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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      day_products: {
        Row: {
          close_time: string | null
          created_at: string
          day_id: string
          id: string
          is_active: boolean
          open_time: string | null
          price: number
          product_id: string
          stock_initial: number
          stock_reserved: number
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_id: string
          id?: string
          is_active?: boolean
          open_time?: string | null
          price?: number
          product_id: string
          stock_initial?: number
          stock_reserved?: number
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_id?: string
          id?: string
          is_active?: boolean
          open_time?: string | null
          price?: number
          product_id?: string
          stock_initial?: number
          stock_reserved?: number
        }
        Relationships: [
          {
            foreignKeyName: "day_products_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_products_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "menu_view"
            referencedColumns: ["day_id"]
          },
          {
            foreignKeyName: "day_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "menu_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "day_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      days: {
        Row: {
          close_time: string
          created_at: string
          date: string
          id: string
          is_open: boolean
          open_time: string
          week_id: string
        }
        Insert: {
          close_time?: string
          created_at?: string
          date: string
          id?: string
          is_open?: boolean
          open_time?: string
          week_id: string
        }
        Update: {
          close_time?: string
          created_at?: string
          date?: string
          id?: string
          is_open?: boolean
          open_time?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "menu_view"
            referencedColumns: ["week_id"]
          },
          {
            foreignKeyName: "days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
          price_per_unit: number
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_per_unit?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_per_unit?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          amount: number
          category: string
          day_date: string
          day_product_id: string | null
          id: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          category: string
          day_date: string
          day_product_id?: string | null
          id?: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          amount?: number
          category?: string
          day_date?: string
          day_product_id?: string | null
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_day_product_id_fkey"
            columns: ["day_product_id"]
            isOneToOne: false
            referencedRelation: "day_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_day_product_id_fkey"
            columns: ["day_product_id"]
            isOneToOne: false
            referencedRelation: "menu_view"
            referencedColumns: ["day_product_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          address_extra: string | null
          created_at: string
          deposit_required: number
          first_name: string
          id: string
          instructions: string | null
          landmark: string | null
          last_name: string
          order_type: string
          paid_amount: number
          paydunya_token: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          phone: string
          reference: string
          status: string
          total: number
        }
        Insert: {
          address: string
          address_extra?: string | null
          created_at?: string
          deposit_required?: number
          first_name: string
          id?: string
          instructions?: string | null
          landmark?: string | null
          last_name: string
          order_type?: string
          paid_amount?: number
          paydunya_token?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          phone: string
          reference: string
          status?: string
          total?: number
        }
        Update: {
          address?: string
          address_extra?: string | null
          created_at?: string
          deposit_required?: number
          first_name?: string
          id?: string
          instructions?: string | null
          landmark?: string | null
          last_name?: string
          order_type?: string
          paid_amount?: number
          paydunya_token?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          reference?: string
          status?: string
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          base_price: number
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          photo_url: string | null
        }
        Insert: {
          active?: boolean
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_url?: string | null
        }
        Update: {
          active?: boolean
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_url?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string | null
          label: string
          notes: string | null
          purchase_date: string
          quantity: number
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          label: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          total_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          label?: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "menu_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weeks: {
        Row: {
          created_at: string
          end_date: string
          id: string
          published_at: string | null
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          published_at?: string | null
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          published_at?: string | null
          start_date?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      menu_view: {
        Row: {
          category: string | null
          close_time: string | null
          day_date: string | null
          day_id: string | null
          day_open: boolean | null
          day_product_id: string | null
          description: string | null
          end_date: string | null
          is_active: boolean | null
          name: string | null
          open_time: string | null
          photo_url: string | null
          price: number | null
          product_id: string | null
          start_date: string | null
          state: string | null
          stock_initial: number | null
          stock_left: number | null
          stock_reserved: number | null
          week_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      place_order: { Args: { p_customer: Json; p_items: Json }; Returns: Json }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
