import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const placeOrder: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listOrders: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateOrderStatus: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=orderController.d.ts.map