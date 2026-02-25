import express, { type Request, type Response } from "express";
const router = express.Router();

interface HealthResponse {
  status: string;
}

router.get("/health", (req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({ status: "OK" });
});

export default router;
