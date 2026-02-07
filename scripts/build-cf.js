#!/usr/bin/env node
/**
 * Build script for Cloudflare deployment
 * Ensures CF_BUILD=true is set for standalone output
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const serverDir = path.join(nextDir, 'server');
const middlewareNftPath = path.join(serverDir, 'middleware.js.nft.json');

// Ensure the middleware files exist
function ensureMiddlewareFiles() {
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  if (!fs.existsSync(middlewareNftPath)) {
    console.log('Creating middleware.js.nft.json...');
    fs.writeFileSync(middlewareNftPath, JSON.stringify({ files: [] }, null, 2));
  }

  const middlewarePath = path.join(serverDir, 'middleware.js');
  if (!fs.existsSync(middlewarePath)) {
    fs.writeFileSync(middlewarePath, '');
  }

  const edgeDir = path.join(serverDir, 'edge');
  if (!fs.existsSync(edgeDir)) {
    fs.mkdirSync(edgeDir, { recursive: true });
  }

  const chunksDir = path.join(edgeDir, 'chunks');
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }
}

// Watch for changes during build
function startWatcher() {
  const interval = setInterval(() => {
    ensureMiddlewareFiles();
  }, 100);

  return () => clearInterval(interval);
}

// Clean previous build
console.log('Cleaning previous build...');
try {
  execSync('rm -rf .next .open-next', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
  // Ignore
}

// Pre-create middleware files
ensureMiddlewareFiles();

// Start watching
const stopWatcher = startWatcher();

// Run Next.js build with CF_BUILD=true
console.log('Starting Next.js build...');
const buildProcess = spawn('pnpm', ['exec', 'next', 'build'], {
  stdio: 'inherit',
  cwd: rootDir,
  env: { ...process.env, CF_BUILD: 'true' },
});

buildProcess.on('close', (code) => {
  stopWatcher();

  if (code === 0) {
    ensureMiddlewareFiles();
    console.log('Next.js build successful!');
    console.log('Running OpenNext Cloudflare build...');

    // Run OpenNext Cloudflare build
    const openNextBuild = spawn(
      'pnpm',
      ['exec', 'opennextjs-cloudflare', 'build', '--skipBuild'],
      {
        stdio: 'inherit',
        cwd: rootDir,
        env: { ...process.env, CF_BUILD: 'true' },
      }
    );

    openNextBuild.on('close', (openNextCode) => {
      if (openNextCode === 0) {
        console.log('OpenNext build successful!');
      }
      process.exit(openNextCode);
    });

    openNextBuild.on('error', (err) => {
      console.error('OpenNext build error:', err);
      process.exit(1);
    });
  } else {
    process.exit(code);
  }
});

buildProcess.on('error', (err) => {
  stopWatcher();
  console.error('Build error:', err);
  process.exit(1);
});
