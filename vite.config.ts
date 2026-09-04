import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function athleteApiPlugin(): Plugin {
  let sharedAthletes = [
    { id: 'ath-1', name: '김반장', rank: '소방위', color: '#f97316' },
    { id: 'ath-2', name: '박대원', rank: '소방장', color: '#ef4444' },
    { id: 'ath-3', name: '이진압', rank: '소방교', color: '#eab308' },
    { id: 'ath-4', name: '최구급', rank: '소방사', color: '#10b981' },
    { id: 'ath-5', name: '정기관', rank: '소방장', color: '#3b82f6' }
  ];

  return {
    name: 'athlete-sync-api',
    configureServer(server) {
      server.middlewares.use('/api/athletes', (req, res, next) => {
        if (!req.url?.startsWith('/api/athletes')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          res.statusCode = 200;
          res.end(JSON.stringify(sharedAthletes));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (Array.isArray(data)) {
                sharedAthletes = data;
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, athletes: sharedAthletes }));
                return;
              } else if (data && data.name) {
                const exists = sharedAthletes.some(
                  (a) => a.id === data.id || (a.name === data.name && a.rank === data.rank)
                );
                if (!exists) {
                  sharedAthletes.push(data);
                }
                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, athlete: data, athletes: sharedAthletes }));
                return;
              }
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              return;
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid athlete data' }));
          });
          return;
        }

        if (req.method === 'DELETE') {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const id = urlObj.searchParams.get('id');
            if (id) {
              sharedAthletes = sharedAthletes.filter((a) => a.id !== id);
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, athletes: sharedAthletes }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Failed to delete' }));
          }
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), athleteApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
