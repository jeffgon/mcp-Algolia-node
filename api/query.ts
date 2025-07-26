import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return res.status(200).json({ message: "POST received!" });
  }

  res.status(200).send("MCP server is live!");
}
