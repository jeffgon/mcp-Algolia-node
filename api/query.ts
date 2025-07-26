import type { VercelRequest, VercelResponse } from '@vercel/node';
import algoliasearch from 'algoliasearch';

const client = algoliasearch('W08WC6SR7N', 'c1e8a9c87c2df23b3faff2a670329b80');
const index = client.initIndex('test_index');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query in request body' });
    }

    try {
      const searchResults = await index.search(query);
      return res.status(200).json(searchResults);
    } catch (error) {
      return res.status(500).json({ error: 'Algolia search failed', details: error.message });
    }
  }

  res.status(200).send("MCP server is live!");
}
