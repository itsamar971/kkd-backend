import { Request, Response } from 'express';

export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    // Mock analytics data for charts
    const salesData = [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 59000 },
      { month: 'Jun', revenue: 75000 }
    ];
    
    const categoryData = [
      { name: 'Vegetables', value: 65 },
      { name: 'Fruits', value: 25 },
      { name: 'Grains', value: 10 }
    ];
    
    return res.status(200).json({ salesData, categoryData });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
