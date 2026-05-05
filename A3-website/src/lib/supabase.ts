import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nlraggbhknralavpouws.supabase.co";
const supabaseAnonKey = "sb_publishable_SiZ4RDpxfbNVMwW-NHWljg_41toYOzh";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);