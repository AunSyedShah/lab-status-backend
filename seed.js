import mongoose from 'mongoose';
import Lab from './models/Lab.js';
import Faculty from './models/Faculty.js';
import Book from './models/Book.js';
import Batch from './models/Batch.js';
import TimeSlot from './models/TimeSlot.js';
import Allocation from './models/Allocation.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab_status';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Lab.deleteMany({});
    await Faculty.deleteMany({});
    await Book.deleteMany({});
    await Batch.deleteMany({});
    await TimeSlot.deleteMany({});
    await Allocation.deleteMany({});
    console.log('Data cleared');

    // Create Labs
    console.log('Creating labs...');
    const labs = await Lab.create([
      { code: 'LAB001', capacity: 30, location: 'Building A, Room 101' },
      { code: 'LAB002', capacity: 25, location: 'Building A, Room 102' },
      { code: 'LAB003', capacity: 40, location: 'Building B, Room 201' },
      { code: 'LAB004', capacity: 35, location: 'Building B, Room 202' }
    ]);
    console.log(`✓ Created ${labs.length} labs`);

    // Create Faculties
    console.log('Creating faculties...');
    const faculties = await Faculty.create([
      { name: 'Computer Science' },
      { name: 'Information Technology' },
      { name: 'Software Engineering' }
    ]);
    console.log(`✓ Created ${faculties.length} faculties`);

    // Create Books
    console.log('Creating books...');
    const books = await Book.create([
      { title: 'Introduction to Algorithms', isbn: '978-0262033848', author: 'Cormen', edition: '3rd' },
      { title: 'Data Structures Using C', isbn: '978-0131997462', author: 'Reema Thareja', edition: '2nd' },
      { title: 'Database Management Systems', isbn: '978-0073523323', author: 'Ramakrishnan', edition: '3rd' },
      { title: 'Web Technologies', isbn: '978-0135919935', author: 'Deitel', edition: '1st' }
    ]);
    console.log(`✓ Created ${books.length} books`);

    // Create Batches
    console.log('Creating batches...');
    const batches = await Batch.create([
      {
        code: 'CSE-2023-A',
        faculty: faculties[0]._id,
        currentSemester: '5',
        currentBook: books[0]._id,
        upcomingBook: books[1]._id,
        numberOfStudents: 45
      },
      {
        code: 'IT-2023-B',
        faculty: faculties[1]._id,
        currentSemester: '4',
        currentBook: books[2]._id,
        upcomingBook: books[3]._id,
        numberOfStudents: 38
      },
      {
        code: 'SE-2023-C',
        faculty: faculties[2]._id,
        currentSemester: '6',
        currentBook: books[1]._id,
        upcomingBook: books[0]._id,
        numberOfStudents: 42
      }
    ]);
    console.log(`✓ Created ${batches.length} batches`);

    // Create Time Slots
    console.log('Creating time slots...');
    const timeSlots = await TimeSlot.create([
      { startTime: '09:00', endTime: '11:00', label: '09:00 AM - 11:00 AM', orderIndex: 1 },
      { startTime: '11:00', endTime: '13:00', label: '11:00 AM - 1:00 PM', orderIndex: 2 },
      { startTime: '14:00', endTime: '16:00', label: '2:00 PM - 4:00 PM', orderIndex: 3 },
      { startTime: '16:00', endTime: '18:00', label: '4:00 PM - 6:00 PM', orderIndex: 4 }
    ]);
    console.log(`✓ Created ${timeSlots.length} time slots`);

    // Create Allocations
    console.log('Creating allocations...');
    const allocations = await Allocation.create([
      {
        lab: labs[0]._id,
        batch: batches[0]._id,
        timeSlot: timeSlots[0]._id,
        dayPattern: 'MWF'
      },
      {
        lab: labs[1]._id,
        batch: batches[0]._id,
        timeSlot: timeSlots[1]._id,
        dayPattern: 'TTS'
      },
      {
        lab: labs[2]._id,
        batch: batches[1]._id,
        timeSlot: timeSlots[0]._id,
        dayPattern: 'MWF'
      },
      {
        lab: labs[3]._id,
        batch: batches[2]._id,
        timeSlot: timeSlots[2]._id,
        dayPattern: 'REGULAR'
      }
    ]);
    console.log(`✓ Created ${allocations.length} allocations`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
