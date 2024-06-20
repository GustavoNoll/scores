import { Router } from "express";
import clientRouter from "./clientRouter";
import oltRouter from "./oltRouter";
import ctoRouter from "./ctoRouter";

const router = Router()
router.use(clientRouter)
router.use(oltRouter)
router.use(ctoRouter)

export default router;