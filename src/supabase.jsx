import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://deqxppojabtezfsusihr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXhwcG9qYWJ0ZXpmc3VzaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTc1NjQsImV4cCI6MjA3NzgzMzU2NH0.Q_cJcAAxQTzIDo26iz8YW_2dN-v1bI1XprzvI5ABJPk";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
