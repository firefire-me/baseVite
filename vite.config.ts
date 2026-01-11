import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // @ 别名
  resolve: {
    // 配置别名：@ → src 目录
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
 
  },
});
