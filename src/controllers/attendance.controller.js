import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { Parser } from 'json2csv';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from '../utils/time.js';

export const checkIn = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: endOfDay(new Date()) }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already checked in today' 
      });
    }

    const checkInTime = new Date();
    const hour = checkInTime.getHours();
    
    // Determine status based on check-in time (9 AM is on time)
    let status = 'present';
    if (hour > 9 || (hour === 9 && checkInTime.getMinutes() > 15)) {
      status = 'late';
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      checkInTime,
      status
    });

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: endOfDay(new Date()) }
    });

    if (!attendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'No check-in found for today' 
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already checked out today' 
      });
    }

    const checkOutTime = new Date();
    const totalHours = (checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);

    // Check for half-day (less than 4 hours)
    if (totalHours < 4) {
      attendance.status = 'half-day';
    }

    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = Number(totalHours.toFixed(2));
    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getMyHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getMySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: 0, // Calculate based on working days if needed
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: endOfDay(new Date()) }
    });

    res.json({
      success: true,
      data: attendance || null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Manager endpoints
export const getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, status, employeeId } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    let filteredAttendance = attendance;
    if (employeeId) {
      filteredAttendance = attendance.filter(a => a.userId?.employeeId === employeeId);
    }

    res.json({
      success: true,
      count: filteredAttendance.length,
      data: filteredAttendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { userId: id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTeamSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const employees = await User.find({ role: 'employee' });
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId');

    const summary = employees.map(emp => {
      const empAttendance = attendance.filter(a => a.userId?._id.toString() === emp._id.toString());
      return {
        employee: {
          _id: emp._id,
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department
        },
        totalDays: empAttendance.length,
        present: empAttendance.filter(a => a.status === 'present').length,
        late: empAttendance.filter(a => a.status === 'late').length,
        halfDay: empAttendance.filter(a => a.status === 'half-day').length,
        totalHours: empAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
      };
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const data = attendance.map(a => ({
      EmployeeID: a.userId?.employeeId,
      Name: a.userId?.name,
      Department: a.userId?.department,
      Date: a.date.toISOString().split('T')[0],
      CheckIn: a.checkInTime.toLocaleTimeString(),
      CheckOut: a.checkOutTime ? a.checkOutTime.toLocaleTimeString() : 'N/A',
      TotalHours: a.totalHours,
      Status: a.status
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTodayTeamStatus = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    
    const attendance = await Attendance.find({
      date: { $gte: today, $lt: endOfDay(new Date()) }
    }).populate('userId', 'name email employeeId department');

    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const present = attendance.length;
    const late = attendance.filter(a => a.status === 'late').length;
    const absent = totalEmployees - present;

    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: attendance.map(a => a.userId._id) }
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        present,
        late,
        absent,
        presentEmployees: attendance,
        absentEmployees
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
