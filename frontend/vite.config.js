import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port:3000,
    // get rid of the cors errors
    proxy:{
        "/api":{
            target:"http://localhost:8080",
            changeOrigin:true,
            secure:false
        }
    }
  }
})
