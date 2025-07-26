import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    res.status(200).json({ message: "POST received!" });
  } else if (req.method === 'GET') {
    res.status(200).send("MCP server is live!");
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
