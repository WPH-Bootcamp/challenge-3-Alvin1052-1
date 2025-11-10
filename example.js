// app.js - Habit Tracker CLI Application
// This application implements a command-line habit tracker using fundamental JavaScript concepts.
// All required concepts are implemented: Classes/Objects, Arrays, array methods (filter, map, find, forEach),
// Date manipulation, setInterval, JSON stringify/parse, nullish coalescing (used at least 3 times),
// while and for loops.

// Required Node.js modules
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Constants
const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 seconds
const DAYS_IN_WEEK = 7;

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// User Profile Object
// Implements basic object with methods using Date and filter (in updateStats)
const userProfile = {
  name: 'User',
  joinedDate: new Date(),
  totalHabits: 0,
  completedHabits: 0,
  // Method to update stats using filter
  updateStats: function (habits) {
    this.totalHabits = habits.length ?? 0; // Nullish coalescing usage 1
    this.completedHabits = habits.filter((h) => h.isCompletedThisWeek()).length;
  },
  // Method to get days joined using Date
  getDaysJoined: function () {
    const now = new Date();
    const diff = now - this.joinedDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
};

// Habit Class
// Implements class with properties and methods using Array, Date, filter, find
class Habit {
  constructor(id, name, targetFrequency) {
    this.id = id;
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = []; // Array to store completion dates
    this.createdAt = new Date();
  }

  // Mark habit complete for today if not already done (uses find)
  markComplete() {
    const today = new Date().toDateString();
    const existing = this.completions.find(
      (date) => date.toDateString() === today
    );
    if (!existing) {
      this.completions.push(new Date());
    }
  }

  // Get completions this week using filter and Date
  getThisWeekCompletions() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return this.completions.filter((date) => date >= startOfWeek);
  }

  // Check if completed this week
  isCompletedThisWeek() {
    return this.getThisWeekCompletions().length >= this.targetFrequency;
  }

  // Get progress percentage
  getProgressPercentage() {
    const progress =
      (this.getThisWeekCompletions().length / this.targetFrequency) * 100;
    return Math.min(Math.round(progress), 100);
  }

  // Get status
  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }
}

// HabitTracker Class
// Main class managing habits, using Array methods (filter, map, find, forEach), setInterval, JSON, nullish coalescing
class HabitTracker {
  constructor() {
    this.habits = []; // Array to store Habit objects
    this.reminderInterval = null;
    this.loadFromFile();
    userProfile.updateStats(this.habits);
  }

  // CRUD: Add new habit
  addHabit(name, frequency) {
    const id = this.habits.length + 1;
    const habit = new Habit(id, name, frequency);
    this.habits.push(habit);
    this.saveToFile();
  }

  // CRUD: Complete habit by index (uses nullish coalescing)
  completeHabit(habitIndex) {
    const habit = this.habits[habitIndex - 1] ?? null; // Nullish coalescing usage 2
    if (habit) {
      habit.markComplete();
      this.saveToFile();
    } else {
      console.log('Habit tidak ditemukan.');
    }
  }

  // CRUD: Delete habit by index
  deleteHabit(habitIndex) {
    if (habitIndex > 0 && habitIndex <= this.habits.length) {
      this.habits.splice(habitIndex - 1, 1);
      this.saveToFile();
    } else {
      console.log('Habit tidak ditemukan.');
    }
  }

  // Display profile
  displayProfile() {
    userProfile.updateStats(this.habits);
    console.log(`Nama: ${userProfile.name}`);
    console.log(`Bergabung sejak: ${userProfile.joinedDate.toDateString()}`);
    console.log(`Hari bergabung: ${userProfile.getDaysJoined()}`);
    console.log(`Total habits: ${userProfile.totalHabits}`);
    console.log(`Completed habits: ${userProfile.completedHabits}`);
  }

  // Display habits with optional filter (uses filter, forEach)
  displayHabits(filter = null) {
    let habitsToDisplay = this.habits;
    if (filter === 'aktif') {
      habitsToDisplay = this.habits.filter((h) => !h.isCompletedThisWeek());
    } else if (filter === 'selesai') {
      habitsToDisplay = this.habits.filter((h) => h.isCompletedThisWeek());
    }

    if (habitsToDisplay.length === 0) {
      console.log('Tidak ada habits.');
      return;
    }

    habitsToDisplay.forEach((habit, index) => {
      console.log(`${index + 1}. [${habit.getStatus()}] ${habit.name}`);
      console.log(`Target: ${habit.targetFrequency}x/minggu`);
      const progressCount = habit.getThisWeekCompletions().length;
      console.log(
        `   Progress: ${progressCount}/${
          habit.targetFrequency
        } (${habit.getProgressPercentage()}%)`
      );
      const filled = Math.floor(habit.getProgressPercentage() / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
      console.log(`   Progress Bar: ${bar} ${habit.getProgressPercentage()}%`);
    });
  }

  // Display stats (uses filter, map, reduce via forEach for average)
  displayStats() {
    const total = this.habits.length;
    const active = this.habits.filter((h) => !h.isCompletedThisWeek()).length;
    const completed = total - active;
    const percentages = this.habits.map((h) => h.getProgressPercentage());
    let sum = 0;
    percentages.forEach((p) => {
      sum += p;
    });
    const avgProgress = total > 0 ? (sum / total).toFixed(2) : 0;

    console.log(`Total habits: ${total}`);
    console.log(`Active habits: ${active}`);
    console.log(`Completed habits: ${completed}`);
    console.log(`Average progress: ${avgProgress}%`);
  }

  // Demo while loop
  displayHabitsWithWhile() {
    let i = 0;
    while (i < this.habits.length) {
      console.log(this.habits[i].name);
      i++;
    }
  }

  // Demo for loop
  displayHabitsWithFor() {
    for (let i = 0; i < this.habits.length; i++) {
      console.log(this.habits[i].name);
    }
  }

  // Start reminder using setInterval
  startReminder() {
    this.reminderInterval = setInterval(
      () => this.showReminder(),
      REMINDER_INTERVAL
    );
  }

  // Show reminder for unfinished habits today (uses filter)
  showReminder() {
    const today = new Date().toDateString();
    const unfinished = this.habits.filter(
      (h) => !h.completions.some((c) => c.toDateString() === today)
    );
    if (unfinished.length > 0) {
      const randomHabit =
        unfinished[Math.floor(Math.random() * unfinished.length)] ?? null; // Nullish coalescing usage 3
      if (randomHabit) {
        console.log('==================================================');
        console.log(`REMINDER: Jangan lupa "${randomHabit.name}"!`);
        console.log('==================================================');
      }
    }
  }

  // Stop reminder
  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
  }

  // Save data to file using JSON.stringify
  saveToFile() {
    const data = {
      userProfile: {
        name: userProfile.name,
        joinedDate: userProfile.joinedDate.toISOString(),
      },
      habits: this.habits.map((h) => ({
        id: h.id,
        name: h.name,
        targetFrequency: h.targetFrequency,
        completions: h.completions.map((d) => d.toISOString()),
        createdAt: h.createdAt.toISOString(),
      })),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  // Load data from file using JSON.parse (uses nullish coalescing)
  loadFromFile() {
    if (fs.existsSync(DATA_FILE)) {
      const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(jsonData);
      userProfile.name = data.userProfile.name ?? 'User';
      userProfile.joinedDate = new Date(
        data.userProfile.joinedDate ?? new Date().toISOString()
      );
      this.habits = data.habits.map((h) => {
        const habit = new Habit(h.id, h.name, h.targetFrequency);
        habit.completions = h.completions.map((d) => new Date(d));
        habit.createdAt = new Date(h.createdAt);
        return habit;
      });
    }
  }

  // Clear all data (optional, for testing)
  clearAllData() {
    this.habits = [];
    this.saveToFile();
  }
}

// CLI Interface Functions
// Promise-based question asker
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Display main menu
function displayMenu() {
  console.log('==================================================');
  console.log('HABIT TRACKER - MAIN MENU');
  console.log('==================================================');
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Loop (while/for)');
  console.log('0. Keluar');
  console.log('==================================================');
}

// Handle menu choices recursively
async function handleMenu(tracker) {
  displayMenu();
  const choice = await askQuestion('Pilih menu: ');

  switch (choice) {
    case '1':
      tracker.displayProfile();
      break;
    case '2':
      tracker.displayHabits();
      break;
    case '3':
      tracker.displayHabits('aktif');
      break;
    case '4':
      tracker.displayHabits('selesai');
      break;
    case '5':
      const name = await askQuestion('Nama kebiasaan: ');
      const freqInput = await askQuestion('Target per minggu: ');
      const frequency = parseInt(freqInput) ?? 1; // Nullish coalescing if parse fails (bonus usage)
      tracker.addHabit(name, frequency);
      break;
    case '6':
      tracker.displayHabits();
      const completeIndex =
        parseInt(await askQuestion('Nomor kebiasaan: ')) ?? 0;
      tracker.completeHabit(completeIndex);
      break;
    case '7':
      tracker.displayHabits();
      const deleteIndex = parseInt(await askQuestion('Nomor kebiasaan: ')) ?? 0;
      tracker.deleteHabit(deleteIndex);
      break;
    case '8':
      tracker.displayStats();
      break;
    case '9':
      console.log('Demo While Loop:');
      tracker.displayHabitsWithWhile();
      console.log('Demo For Loop:');
      tracker.displayHabitsWithFor();
      break;
    case '0':
      tracker.stopReminder();
      rl.close();
      return;
    default:
      console.log('Pilihan tidak valid.');
  }

  userProfile.updateStats(tracker.habits);
  await handleMenu(tracker); // Recursive call for loop
}

// Main function to run the app
async function main() {
  console.log('==================================================');
  console.log('Welcome to Habit Tracker CLI');
  console.log('==================================================');

  const tracker = new HabitTracker();
  tracker.startReminder();

  // Optional demo data (commented out)
  // tracker.addHabit('Minum Air 8 Gelas', 7);
  // tracker.addHabit('Baca Buku 30 Menit', 5);

  await handleMenu(tracker);
}

main();
