import { Request, Response } from 'express';

export const getMandiPrices = async (req: Request, res: Response) => {
  try {
    const prices = [
      { id: '1', crop: 'Tomatoes', mandiPrice: 40, platformAvgPrice: 45, trend: 'up' },
      { id: '2', crop: 'Onions', mandiPrice: 25, platformAvgPrice: 24, trend: 'stable' },
      { id: '3', crop: 'Potatoes', mandiPrice: 15, platformAvgPrice: 20, trend: 'down' },
      { id: '4', crop: 'Wheat', mandiPrice: 22, platformAvgPrice: 35, trend: 'up' } // significant deviation
    ];
    return res.status(200).json(prices);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
