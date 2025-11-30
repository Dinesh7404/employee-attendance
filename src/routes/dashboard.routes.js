import express from 'express';
import { getEmployeeStats, getManagerStats } from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/employee', protect, authorize('employee'), getEmployeeStats);
router.get('/manager', protect, authorize('manager'), getManagerStats);

export default router;
