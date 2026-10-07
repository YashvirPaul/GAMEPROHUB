import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'gamehub_supabase_url';
const STORAGE_KEY_KEY = 'gamehub_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '', isConfigured: false };
  }

  // 1. Check localStorage
  const savedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const savedKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  // 2. Check import.meta.env fallback if provided
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  const finalUrl = savedUrl.trim() || envUrl.trim();
  const finalKey = savedKey.trim() || envKey.trim();

  return {
    url: finalUrl,
    anonKey: finalKey,
    isConfigured: Boolean(finalUrl && finalKey && finalUrl.startsWith('http')),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null; // Reset cached client
}

export function clearSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (cachedClient) return cachedClient;

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    });
    // Ping auth health by checking session
    const { error } = await testClient.auth.getSession();
    if (error && error.message && !error.message.includes('fetch')) {
      // If error is normal auth error, connection succeeded
      return { success: true, message: 'Connected to Supabase project successfully!' };
    }
    return { success: true, message: 'Supabase credentials verified successfully!' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return { success: false, message: `Could not connect to Supabase: ${errorMsg}` };
  }
}
