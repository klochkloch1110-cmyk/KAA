import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const projectRoot = path.resolve(__dirname)

// The workspace is often opened through C:/Users/... while the real project is
// on A:/DesktopMoved/.... Vite's dependency optimizer uses process.cwd() for
// output matching; mixed C:/ and A:/ paths make optimizer metadata inconsistent
// and can crash dev startup with "reading 'imports'". Normalize cwd once here.
if (process.cwd() !== projectRoot) {
  process.chdir(projectRoot)
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  // The workspace can be opened through a Windows junction/symlink. Pinning the
  // Vite root to the resolved config directory keeps Rollup asset names relative
  // and prevents build failures with mixed C:/ and A:/ paths.
  root: projectRoot,
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
