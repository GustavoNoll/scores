import { Router } from "express";
import clientRouter from "./clientRouter";
import oltRouter from "./oltRouter";
import ctoRouter from "./ctoRouter";
import acsInformRouter from "./acsInformRouter";

const router = Router()
router.use(clientRouter)
router.use(oltRouter)
router.use(ctoRouter)
router.use(acsInformRouter)

export default router;