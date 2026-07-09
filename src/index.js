/**
 * StacksIndex - Lightweight open indexer for Stacks smart contracts
 *
 * Sample archetype for the LAB Open Source Builders Fund.
 * This file shows the shape of an indexer entrypoint. Not production code.
 */

require('dotenv').config();
const express = require('express');
const { startIngester } = require('./ingester');
const { startQueryApi } = require('./api');

const PORT = process.env.PORT || 3000;

async function main() {
  console.log('Starting StacksIndex...');

  // Start the ingester in the background
  startIngester({
    hiroApiUrl: process.env.HIRO_API_URL,
    databaseUrl: process.env.DATABASE_URL,
    pollIntervalMs: 15000,
  }).catch((err) => {
    console.error('Ingester failed:', err);
    process.exit(1);
  });

  // Start the query API
  const app = startQueryApi({
    databaseUrl: process.env.DATABASE_URL,
  });

  app.listen(PORT, () => {
    console.log(`Query API running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
