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
      contracts: {
        Row: {
          contract_price: number | null
          created_at: string
          created_by: string
          customer_email: string | null
          customer_first_name: string
          customer_last_name: string
          customer_phone: string | null
          dealer_cost: number | null
          dealership_id: string
          end_date: string | null
          id: string
          product_id: string
          provider_id: string
          start_date: string | null
          status: string
          updated_at: string
          vehicle_make: string
          vehicle_mileage: number | null
          vehicle_model: string
          vehicle_vin: string
          vehicle_year: number
        }
        Insert: {
          contract_price?: number | null
          created_at?: string
          created_by: string
          customer_email?: string | null
          customer_first_name: string
          customer_last_name: string
          customer_phone?: string | null
          dealer_cost?: number | null
          dealership_id: string
          end_date?: string | null
          id?: string
          product_id: string
          provider_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
          vehicle_make: string
          vehicle_mileage?: number | null
          vehicle_model: string
          vehicle_vin: string
          vehicle_year: number
        }
        Update: {
          contract_price?: number | null
          created_at?: string
          created_by?: string
          customer_email?: string | null
          customer_first_name?: string
          customer_last_name?: string
          customer_phone?: string | null
          dealer_cost?: number | null
          dealership_id?: string
          end_date?: string | null
          id?: string
          product_id?: string
          provider_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          vehicle_make?: string
          vehicle_mileage?: number | null
          vehicle_model?: string
          vehicle_vin?: string
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_members: {
        Row: {
          created_at: string
          dealership_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dealership_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dealership_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_members_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          address: string | null
          admin_code: string
          compliance_info: Json | null
          created_at: string
          id: string
          license_number: string | null
          name: string
          phone: string | null
          province: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_code?: string
          compliance_info?: Json | null
          created_at?: string
          id?: string
          license_number?: string | null
          name: string
          phone?: string | null
          province?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_code?: string
          compliance_info?: Json | null
          created_at?: string
          id?: string
          license_number?: string | null
          name?: string
          phone?: string | null
          province?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          coverage_details: Json | null
          created_at: string
          description: string | null
          eligibility_rules: Json | null
          id: string
          name: string
          pricing: Json | null
          provider_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          coverage_details?: Json | null
          created_at?: string
          description?: string | null
          eligibility_rules?: Json | null
          id?: string
          name: string
          pricing?: Json | null
          provider_id: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          coverage_details?: Json | null
          created_at?: string
          description?: string | null
          eligibility_rules?: Json | null
          id?: string
          name?: string
          pricing?: Json | null
          provider_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_members: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_members_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          regions_served: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          regions_served?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          regions_served?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      remittances: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          due_date: string
          id: string
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          due_date: string
          id?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "remittances_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_dealership_member: {
        Args: { _dealership_id: string; _user_id: string }
        Returns: boolean
      }
      is_provider_member: {
        Args: { _provider_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "dealership_admin"
        | "dealership_employee"
        | "provider"
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
    Enums: {
      app_role: [
        "super_admin",
        "dealership_admin",
        "dealership_employee",
        "provider",
      ],
    },
  },
} as const
