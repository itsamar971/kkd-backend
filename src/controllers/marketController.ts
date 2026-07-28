import { Request, Response } from 'express';

export const getMarketPrices = async (req: Request, res: Response) => {
  // Static data for now, but served from backend to remove mocks from frontend
  const marketPrices = [
    { crop:'Tomato',  msp:'₹25/kg',  current:'₹28/kg', trend:'up'   },
    { crop:'Onion',   msp:'₹18/kg',  current:'₹22/kg', trend:'up'   },
    { crop:'Wheat',   msp:'₹21/kg',  current:'₹24/kg', trend:'up'   },
    { crop:'Rice',    msp:'₹30/kg',  current:'₹28/kg', trend:'down' },
    { crop:'Potato',  msp:'₹15/kg',  current:'₹13/kg', trend:'down' },
  ];
  return res.status(200).json(marketPrices);
};
