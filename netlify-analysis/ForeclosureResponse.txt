import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface ForeclosureResponse {
  id: string
  user_id: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  situation_length?: string
  payment_difficulty_date?: string
  lender?: string
  payment_status?: string
  missed_payments?: number
  nod?: string
  property_type?: string
  relief_contacted?: string
  home_value?: string
  mortgage_balance?: string
  liens?: string
  challenge?: string
  lender_issue?: string
  impact?: string
  options_narrowing?: string
  third_party_help?: string
  overwhelmed?: string
  implication_credit?: string
  implication_loss?: string
  implication_stay_duration?: string
  legal_concerns?: string
  future_impact?: string
  financial_risk?: string
  interested_solution?: string
  negotiation_help?: string
  sell_feelings?: string
  credit_importance?: string
  resolution_peace?: string
  open_options?: string
  status: 'submitted' | 'reviewed' | 'contacted' | 'closed'
  notes?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  membership_tier: 'free' | 'pro' | 'enterprise'
  stripe_customer_id?: string
  subscription_id?: string
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
  last_sign_in?: string
  created_at: string
  updated_at: string
}