import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  let aliases: Record<string, string> = {};
  if (fs.existsSync(path.resolve(__dirname, '../../packages'))) {
    const packages = fs.readdirSync(path.resolve(__dirname, '../../packages'));
    aliases = {
      'data-generator-retail': path.resolve(__dirname, '../data-generator/src'),
    };
    for (const dirName of packages) {
      if (dirName === 'create-react-admin') continue;
      const packageJson = JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, '../../packages', dirName, 'package.json'),
          'utf8'
        )
      );
      aliases[packageJson.name] = path.resolve(
        __dirname,
        `../../packages/${packageJson.name}/src`
      );
    }
  }

  const base = process.env.VITE_BASE || '/';
  return {
    base,
    plugins: [react()],
    server: {
      port: 8000,
      open: true,
    },
    esbuild: {
      keepNames: true,
    },
    define: {
      'process.env': Object.keys(process.env)
        .filter((key) => key.startsWith('VITE_'))
        .reduce((env, key) => {
          env[`VITE_${key}`] = JSON.stringify(process.env[key]);
          return env;
        }, {}),
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 5000,
    },
    resolve: {
      preserveSymlinks: true,
      alias: [
        ...Object.keys(aliases).map((packageName) => ({
          find: packageName,
          replacement: aliases[packageName],
        })),
      ],
    },
  };
});
