'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns null when env vars are absent (app falls back to localStorage)
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const SETTINGS_KEY = 'global';
