import express from "express";
import { registerTest, verifyTest } from "../controllers/authTestController.js";

const router = express.Router();

router.post("/register-test", registerTest);
router.get("/verify-test", verifyTest);

export default router;
