/**
 * Ingester - polls the Stacks chain for new blocks and transactions
 */

const axios = require('axios');
const { Pool } = require('pg');
const { decodeEvent } = require('./decoder');

async function startIngester({ hiroApiUrl, databaseUrl, pollIntervalMs }) {
  const db = new Pool({ connectionString: databaseUrl });
  let lastIndexedBlock = await getLastIndexedBlock(db);

  console.log(`Ingester starting from block ${lastIndexedBlock}`);

  while (true) {
    try {
      const tip = await getChainTip(hiroApiUrl);

      while (lastIndexedBlock < tip) {
        const nextBlock = lastIndexedBlock + 1;
        await indexBlock(db, hiroApiUrl, nextBlock);
        lastIndexedBlock = nextBlock;
      }
    } catch (err) {
      console.error('Ingester loop error:', err.message);
    }

    await sleep(pollIntervalMs);
  }
}

async function getChainTip(hiroApiUrl) {
  const res = await axios.get(`${hiroApiUrl}/v2/info`);
  return res.data.stacks_tip_height;
}

async function getLastIndexedBlock(db) {
  const res = await db.query(
    'SELECT MAX(block_height) as height FROM indexed_blocks'
  );
  return res.rows[0].height || 0;
}

async function indexBlock(db, hiroApiUrl, blockHeight) {
  const blockRes = await axios.get(
    `${hiroApiUrl}/extended/v1/block/by_height/${blockHeight}`
  );
  const block = blockRes.data;

  for (const txId of block.txs) {
    const txRes = await axios.get(`${hiroApiUrl}/extended/v1/tx/${txId}`);
    const tx = txRes.data;

    if (tx.tx_type === 'contract_call') {
      await indexContractCall(db, tx);
    }
  }

  await db.query(
    'INSERT INTO indexed_blocks (block_height, indexed_at) VALUES ($1, NOW())',
    [blockHeight]
  );
}

async function indexContractCall(db, tx) {
  const events = tx.events || [];
  for (const event of events) {
    const decoded = decodeEvent(event);
    if (decoded) {
      await db.query(
        `INSERT INTO contract_events
         (tx_id, contract_id, event_type, event_data, block_height)
         VALUES ($1, $2, $3, $4, $5)`,
        [tx.tx_id, tx.contract_call.contract_id, decoded.type, decoded.data, tx.block_height]
      );
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { startIngester };
