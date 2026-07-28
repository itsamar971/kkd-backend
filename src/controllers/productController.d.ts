import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const createProduct: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProduct: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=productController.d.ts.map