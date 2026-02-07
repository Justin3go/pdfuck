#!/usr/bin/env node
/**
 * Build script that ensures middleware.js.nft.json always exists
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');
const serverDir = path.join(nextDir, 'server');
const middlewareNftPath = path.join(serverDir, 'middleware.js.nft.json');

// Ensure the file exists
function ensureFile() {
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  if (!fs.existsSync(middlewareNftPath)) {
    console.log('Creating middleware.js.nft.json...');
    fs.writeFileSync(middlewareNftPath, JSON.stringify({ files: [] }, null, 2));
  }

  // Also ensure middleware.js exists
  const middlewarePath = path.join(serverDir, 'middleware.js');
  if (!fs.existsSync(middlewarePath)) {
    fs.writeFileSync(middlewarePath, '');
  }

  // Ensure edge directory exists
  const edgeDir = path.join(serverDir, 'edge');
  if (!fs.existsSync(edgeDir)) {
    fs.mkdirSync(edgeDir, { recursive: true });
  }

  // Ensure chunks directory exists
  const chunksDir = path.join(edgeDir, 'chunks');
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }
}

// Watch for changes
function startWatcher() {
  const interval = setInterval(() => {
    ensureFile();
  }, 100); // Check every 100ms

  return () => {
    clearInterval(interval);
  };
}

// Clean previous build
try {
  execSync('rm -rf .next .open-next', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (e) {
  // Ignore
}

// Pre-create
ensureFile();

// Start watching
const stopWatcher = startWatcher();

// Run build
console.log('Starting Next.js build...');
const buildProcess = require('child_process').spawn('pnpm', ['exec', 'next', 'build'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, CF_BUILD: 'true' }
});

buildProcess.on('close', (code) => {
  stopWatcher();

  if (code === 0) {
    // Post-build fixes
    ensureFile();
    console.log('Build successful!');
  }

  process.exit(code);
});

buildProcess.on('error', (err) => {
  stopWatcher();
  console.error('Build error:', err);
  process.exit(1);
});
