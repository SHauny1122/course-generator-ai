import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // Expose env variables to client-side code
      'process.env.VITE_NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.VITE_NEXT_PUBLIC_SUPABASE_URL),
      'process.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  }
})
