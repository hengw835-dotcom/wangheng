import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('echarts') || id.includes('zrender')) return 'charts'
          if (id.includes('three')) return 'three'
          if (id.includes('element-plus')) return 'element-plus'
          if (id.includes('vue') || id.includes('pinia')) return 'vue-vendor'
          return 'vendor'
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_TARGET || 'http://localhost:8086',
        changeOrigin: true,
        headers: {
          Origin: 'http://localhost:3000'
        },
        configure(proxy) {
          proxy.on('proxyReq', proxyReq => {
            proxyReq.setHeader('Origin', 'http://localhost:3000')
          })
        },
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
