import express from 'express';
import {
  checkIn,
  checkOut,
  getMyHistory,
  getMySummary,
  getTodayStatus,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  exportAttendance,
  getTodayTeamStatus
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Employee routes
router.post('/checkin', protect, authorize('employee'), checkIn);
router.post('/checkout', protect, authorize('employee'), checkOut);
router.get('/my-history', protect, authorize('employee'), getMyHistory);
router.get('/my-summary', protect, authorize('employee'), getMySummary);
router.get('/today', protect, authorize('employee'), getTodayStatus);

// Manager routes
router.get('/all', protect, authorize('manager'), getAllAttendance);
router.get('/employee/:id', protect, authorize('manager'), getEmployeeAttendance);
router.get('/summary', protect, authorize('manager'), getTeamSummary);
router.get('/export', protect, authorize('manager'), exportAttendance);
router.get('/today-status', protect, authorize('manager'), getTodayTeamStatus);

export default router;
