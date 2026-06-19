import { defineConfig } from 'vite';

export default defineConfig({
  base: '/controle-gastos/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:     'index.html',
        login:    'login.html',
        register: 'register.html',
        profile:  'profile.html',
        admin:    'admin.html',
      },
    },
  },
});
