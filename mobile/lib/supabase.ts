import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sdcmpmfcqmfzkeizvvlf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY21wbWZjcW1memtlaXp2dmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNzIxODAsImV4cCI6MjA4MTk0ODE4MH0.-cKq9s3jHf1z_X7ukK4lHDFVFOkbi6uTVMoks67GrQg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
