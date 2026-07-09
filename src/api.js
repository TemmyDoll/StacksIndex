/**
 * Query API - exposes indexed data through REST endpoints
 */

const express = require('express');
const { Pool } = require('pg');

function startQueryApi({ databaseUrl }) {
  const app = express();
  const db = new Pool({ connectionString: databaseUrl });

  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get events for a contract
  app.get('/contracts/:contractId/events', async (req, res) => {
    try {
      const { contractId } = req.params;
      const { limit = 50, offset = 0, event_type } = req.query;

      let query = `
        SELECT tx_id, event_type, event_data, block_height
        FROM contract_events
        WHERE contract_id = $1
      `;
      const params = [contractId];

      if (event_type) {
        query += ' AND event_type = $2';
        params.push(event_type);
      }

      query += ' ORDER BY block_height DESC LIMIT $' + (params.length + 1);
      params.push(parseInt(limit));
      query += ' OFFSET $' + (params.length + 1);
      params.push(parseInt(offset));

      const result = await db.query(query, params);
      res.json({ events: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get chain sync status
  app.get('/status', async (req, res) => {
    try {
      const result = await db.query(
        'SELECT MAX(block_height) as indexed_height FROM indexed_blocks'
      );
      res.json({
        indexed_height: result.rows[0].indexed_height || 0,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}

module.exports = { startQueryApi };
