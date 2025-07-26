import type { VercelRequest, VercelResponse } from '@vercel/node';
import algoliasearch from 'algoliasearch';

const client = algoliasearch('YourAlgoliaAppId', 'YourAlgoliaAdminApiKey');
const index = client.initIndex('your_index_name');

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
