import express from "express";
import domainRouter from "./domain";

const router = express.Router();

router.use("/domain", domainRouter);

export default router;
