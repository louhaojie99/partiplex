import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const packageRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: packageRoot,
  plugins: [
    vue(),
    dts({
      root: packageRoot,
      outDir: resolve(packageRoot, 'dist'),
      entryRoot: resolve(packageRoot, 'src'),
      include: [resolve(packageRoot, 'src')],
      tsconfigPath: resolve(packageRoot, 'tsconfig.build.json'),
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(packageRoot, 'src/index.ts'),
        'vue/index': resolve(packageRoot, 'src/vue/index.ts'),
        'react/index': resolve(packageRoot, 'src/react/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
