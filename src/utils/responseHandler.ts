import { Response } from 'express';

interface ResponseMessage {
    status: number;
    message: string;
    data?: any;
}

export const responseHandler = (res: Response, { status, message, data }: ResponseMessage) => {
    res.status(status).json({ message, ...(data ? { data } : {}) });
};
