/*
 * @Date: 2022-03-11 15:22:08
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-11 15:29:03
 * @Description: file content
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WidicssPlugin from 'vite-plugin-windicss'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/dom-to-pdf/',
    server: {
        open: true,
        host: '0.0.0.0',
        port: 3333
    },
    plugins: [react(), WidicssPlugin()]
})
