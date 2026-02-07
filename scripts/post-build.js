#!/usr/bin/env node
/**
 * Post-build script to fix missing files for opennextjs-cloudflare
 */
const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');
const serverDir = path.join(nextDir, 'server');

// Create middleware.js.nft.json if missing
const middlewareNftPath = path.join(serverDir, 'middleware.js.nft.json');
if (!fs.existsSync(middlewareNftPath)) {
  console.log('Creating middleware.js.nft.json...');
  fs.writeFileSync(middlewareNftPath, JSON.stringify({ files: [] }, null, 2));
}

// Create middleware.js if missing (empty file)
const middlewarePath = path.join(serverDir, 'middleware.js');
if (!fs.existsSync(middlewarePath)) {
  console.log('Creating middleware.js...');
  fs.writeFileSync(middlewarePath, '');
}

console.log('Post-build fixes applied!');
