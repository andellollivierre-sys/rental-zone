import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rlfezrrxfgnwznsyftnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5OSWuy9Xrj7iZe-q8JzBjA_k5ehm9cx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
