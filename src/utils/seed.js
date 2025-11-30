import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Attendance.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create manager first
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'password123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management'
    });

    console.log('✅ Manager created:', manager.email);

    // Create employees
    const employees = await User.create([
      {
        name: 'Sudhe Smith',
        email: 'sudhe@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Hema Johnson',
        email: 'hema@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Carol Williams',
        email: 'carol@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Marketing'
      },
      {
        name: 'David Brown',
        email: 'david@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Sales'
      }
    ]);

    console.log('✅ Employees created:', employees.length);

    // Create sample attendance for last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      for (const emp of employees) {
        // Skip some random days to simulate absences
        if (Math.random() > 0.9) continue;

        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMinute, 0, 0);

        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const checkOutMinute = Math.floor(Math.random() * 60);
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMinute, 0, 0);

        const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);
        let status = 'present';
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
          status = 'late';
        }

        await Attendance.create({
          userId: emp._id,
          date,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          status,
          totalHours: Number(totalHours.toFixed(2))
        });
      }
    }

    console.log('✅ Seed data created successfully');
    console.log('\n📧 Login Credentials:');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: sudhe@company.com / password123');
    console.log('Employee: hema@company.com / password123');
    console.log('\nRun the backend server: npm start');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
