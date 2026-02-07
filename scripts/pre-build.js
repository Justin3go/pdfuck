#!/usr/bin/env node
/**
 * Pre-build script to ensure required files exist
 */
const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');
const serverDir = path.join(nextDir, 'server');

// Ensure server directory exists
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

// Create middleware.js.nft.json if missing
const middlewareNftPath = path.join(serverDir, 'middleware.js.nft.json');
if (!fs.existsSync(middlewareNftPath)) {
  console.log('Pre-creating middleware.js.nft.json...');
  fs.writeFileSync(middlewareNftPath, JSON.stringify({ files: [] }, null, 2));
}

console.log('Pre-build setup complete!');
