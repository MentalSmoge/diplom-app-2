import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.cookies.jwt;

    try {
        const verified = jwt.verify(token, "secret") as JwtPayload;
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: err });
    }
}