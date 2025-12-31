const express = require("express");
import type { Request, Response } from "express";
const router = express.Router();

interface HealthResponse {
    status: string;
}

router.get("/health", (req: Request, res: Response<HealthResponse>) => {
    res.status(200).json({ status: "OK" });
});

module.exports = router;
