import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from '../utils/time.js';

export const getEmployeeStats = async (req, res) => {
  try {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay(today), $lt: endOfDay(today) }
    });

    // This month's attendance
    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Last 7 days
    const last7Days = await Attendance.find({
      userId: req.user._id,
      date: { $gte: subDays(today, 7), $lte: today }
    }).sort({ date: -1 });

    const stats = {
      todayStatus: todayAttendance ? {
        checkedIn: !!todayAttendance.checkInTime,
        checkInTime: todayAttendance.checkInTime,
        checkOutTime: todayAttendance.checkOutTime,
        status: todayAttendance.status,
        totalHours: todayAttendance.totalHours
      } : { checkedIn: false },
      thisMonth: {
        totalDays: monthAttendance.length,
        present: monthAttendance.filter(a => a.status === 'present').length,
        late: monthAttendance.filter(a => a.status === 'late').length,
        halfDay: monthAttendance.filter(a => a.status === 'half-day').length,
        totalHours: monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
      },
      recentAttendance: last7Days
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getManagerStats = async (req, res) => {
  try {
    const today = new Date();
    
    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: startOfDay(today), $lt: endOfDay(today) }
    }).populate('userId');

    const present = todayAttendance.length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const absent = totalEmployees - present;

    // Absent employees today
    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: todayAttendance.map(a => a.userId._id) }
    });

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const count = await Attendance.countDocuments({
        date: { $gte: startOfDay(date), $lt: endOfDay(date) }
      });
      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Department-wise attendance
    const departments = await User.distinct('department', { role: 'employee' });
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptEmployees = await User.find({ department: dept, role: 'employee' });
        const deptAttendance = todayAttendance.filter(a => 
          deptEmployees.some(emp => emp._id.toString() === a.userId._id.toString())
        );
        return {
          department: dept,
          total: deptEmployees.length,
          present: deptAttendance.length
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalEmployees,
        todayStats: {
          present,
          late,
          absent
        },
        absentEmployees,
        weeklyTrend,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
