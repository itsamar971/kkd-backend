import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getMandiPrices = async (req: Request, res: Response) => {
  try {
    const productsSnap = await db.collection('products').get();
    const products = productsSnap.docs.map(doc => doc.data());

    const cropStats: Record<string, { total: number; count: number }> = {};
    products.forEach((p: any) => {
      if (p.name && p.pricePerKg) {
        const cropName = p.name.trim();
        if (!cropStats[cropName]) {
          cropStats[cropName] = { total: 0, count: 0 };
        }
        cropStats[cropName].total += Number(p.pricePerKg);
        cropStats[cropName].count += 1;
      }
    });

    let apiData: any[] = [];
    try {
      const agmarkRes = await fetch(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd39463285f47a36702f077e480625a&format=json&limit=10'
      );
      const json: any = await agmarkRes.json();
      apiData = json?.records || [];
    } catch (e) {
      console.log('Agmarknet APMC live fetch fallback benchmark mode');
    }

    const baseCrops = [
      { id: '1', crop: 'Tomatoes', mandiPrice: 40, trend: 'up' },
      { id: '2', crop: 'Onions', mandiPrice: 25, trend: 'stable' },
      { id: '3', crop: 'Potatoes', mandiPrice: 15, trend: 'down' },
      { id: '4', crop: 'Wheat', mandiPrice: 22, trend: 'up' },
      { id: '5', crop: 'Rice', mandiPrice: 32, trend: 'stable' },
      { id: '6', crop: 'Apples', mandiPrice: 110, trend: 'up' }
    ];

    const result = baseCrops.map(item => {
      const apiItem = apiData.find((r: any) => 
        r.commodity && r.commodity.toLowerCase().includes(item.crop.toLowerCase())
      );

      const liveMandiPrice = apiItem && apiItem.modal_price ? Math.round(Number(apiItem.modal_price) / 100) : item.mandiPrice;

      const stat = cropStats[item.crop];
      const platformAvgPrice = stat && stat.count > 0 ? Math.round(stat.total / stat.count) : (liveMandiPrice + 5);

      return {
        id: item.id,
        crop: item.crop,
        mandiPrice: liveMandiPrice,
        platformAvgPrice: platformAvgPrice,
        trend: item.trend
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching Mandi prices:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
