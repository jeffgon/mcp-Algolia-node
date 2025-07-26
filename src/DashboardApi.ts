// src/DashboardApi.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // For now, just respond with a simple message to test the route
    res.status(200).json({ message: "POST received!" });
  } else if (req.method === 'GET') {
    res.status(200).send("MCP server is live!");
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
