#!/bin/bash
echo "Setting up RadiantMoney project..."

# Ensure we're in the project directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Are you in the project directory?"
  echo "Run: cd /path/to/RadiantMoney"
  exit 1
fi

echo "1. Cleaning up..."
rm -rf node_modules package-lock.json

echo "2. Updating package.json..."
cat > package.json << 'EOF'
{
  "name": "RadiantMoney",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
EOF

echo "3. Creating TypeScript config..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF

echo "4. Installing dependencies..."
npm install

echo "5. Creating vite.config.ts if missing..."
if [ ! -f "vite.config.ts" ]; then
  cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
EOF
fi

echo "6. Starting development server..."
npm run dev