/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/pnpm-lock.yaml',
      '**/pnpm.yaml',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/types.ts',
        'src/useTaskTimer/types.ts',
        'src/domain/timer/model.ts',
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        branches: 85,
        functions: 78,
        autoUpdate: false,
        perFile: false,
        'src/domain/timer/**': {
          lines: 90,
          statements: 90,
          branches: 82,
          functions: 95,
        },
      },
    },
  },
});
