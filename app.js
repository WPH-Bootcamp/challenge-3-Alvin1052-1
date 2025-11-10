const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { isStringObject } = require('util/types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 detik

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('==================================================');
  console.log('Welcome to Habit Tracker CLI');
  console.log('==================================================');
  await Profile();
}

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
async function HandleMenu(tracker) {
  tracker.setReminder();

  displayMenu();
  const choice = await askQuestion('Pilih menu: ');
  switch (choice) {
    //Display Profile
    case '1':
      tracker.displayProfile();
      break;
    //Display semua habits
    case '2':
      tracker.displayHabits();
      break;
    //Display Active Habits
    case '3':
      tracker.displayHabits('active');
      break;
    //Display Completed Habits
    case '4':
      tracker.displayHabits('done');
      break;
    //Display Add Habit
    case '5':
      const name = await askQuestion('Nama kebiasaan: ');

      let freqInput;
      do {
        freqInput = await askQuestion('Target per minggu: ');
      } while (isNaN(freqInput) === true || freqInput < 1 || freqInput === '');

      // const freqInput = await askQuestion('Target per minggu: ');

      const frequency = parseInt(freqInput) ?? 1; // Nullish coalescing if parse fails (bonus usage)
      tracker.addHabit(name, frequency);
      break;
    //mark as Complete Habit
    case '6':
      if (tracker.habits.length == 0) {
        console.log('tidak ada kebiasaan');
        break;
      }
      tracker.displayHabits();
      const haveActive = tracker.habits.some(
        (habit) => habit.finished === false
      );

      if (!haveActive) {
        console.log('dont have aktif Habits');
        break;
      }

      const completeIndex =
        parseInt(await askQuestion('Nomor kebiasaan: ')) ?? 0;
      tracker.markCompleteOneTime(completeIndex - 1);
      break;
    // Delete Habit
    case '7':
      tracker.displayHabits();
      const deleteIndex = parseInt(await askQuestion('Nomor kebiasaan: ')) ?? 0;
      tracker.deleteHabit(deleteIndex);
      break;
    // Display Statistics
    case '8':
      tracker.displayStatistics();
      break;
    // Demo Loop
    case '9':
      tracker.demoLoop();
      break;
    // Exit
    case '0':
      rl.close();
      return;
    default:
      console.log('Invalid choice. Please try again.');
      console.log('');
  }

  HandleMenu(tracker);
}

async function Profile() {
  let data = { userProfile: {}, habits: [] };
  if (fs.existsSync(DATA_FILE)) {
    try {
      const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(jsonData);
    } catch (error) {
      console.log('File data rusak atau kosong. Mulai dari awal.');
    }
  }

  const loadedhabits = data.habits.map((h) => {
    return new Habit(
      h.id,
      h.name,
      h.targetFrequency,
      h.completions.map((d) => new Date(d)),
      new Date(h.createdAt),
      h.finished
    );
  });

  const nama =
    data.userProfile.name ?? (await askQuestion('What is your name? '));

  let age = data.userProfile.age;

  if (!age) {
    do {
      age = await askQuestion('How Old Are You ? ');
    } while (isNaN(age) === true || age === '');
  }

  const kelas =
    data.userProfile.kelas ?? (await askQuestion('What is your Class? '));
  const joinDate = data.userProfile.joinDate
    ? new Date(data.userProfile.joinDate)
    : new Date();

  const tracker = new HabitTracker(nama, age, kelas, joinDate, loadedhabits);

  tracker.saveToFile();
  HandleMenu(tracker);
}

class HabitTracker {
  constructor(name, age, kelas, joinDate, habits) {
    this.profile = {
      name: name,
      age: age,
      kelas: kelas,
      joinDate: joinDate ?? new Date(),
    };
    this.habits = habits ?? [];
    this.reminderStatus = false;
  }

  addHabit(name, targetFrequency) {
    const habit = new Habit(this.habits.length + 1, name, targetFrequency);
    this.habits.push(habit);
    console.log('new habit added.');
    console.log('current active Habits:');
    this.displayHabits('active');
    this.saveToFile();
  }

  displayProfile() {
    console.log('==================================================');
    console.log('HABIT TRACKER CLI - CHALLENGE 3');
    console.log('==================================================');
    console.log(`NAMA: ${this.profile.name}`);
    console.log(`UMUR: ${this.profile.age}`);
    console.log(`KELAS: ${this.profile.kelas}`);
    console.log(`TANGGAL: ${new Date(this.profile.joinDate).toDateString()}`);
    console.log('==================================================');
  }

  displayHabits(filter = null) {
    let habitToDisplay = this.habits;

    if (filter === 'active') {
      habitToDisplay = this.habits.filter((habit) => habit.finished === false);
    } else if (filter === 'done') {
      habitToDisplay = this.habits.filter((habit) => habit.finished === true);
    }

    if (habitToDisplay.length === 0) {
      console.log(`do not have any habits.`);
      return;
    }

    habitToDisplay.forEach((habit, index) => {
      const ProgressCount = habit.getCompletionsThisWeek().length;
      const ProgressPercentage = (ProgressCount / habit.targetFrequency) * 100;
      const filled = Math.floor(ProgressPercentage / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

      console.log(
        `${index + 1}. [${habit.finished ? 'done' : 'active'}] ${habit.name}`
      );
      console.log(`Target: ${habit.targetFrequency}x/minggu`);
      console.log(
        `Progress: ${ProgressCount}/${habit.targetFrequency} ${ProgressPercentage}%)`
      );
      console.log(`Progress Bar: ${bar} ${ProgressPercentage}%`);
    });
  }

  markCompleteOneTime(habitIndex) {
    const FinishedDate = new Date();
    const isCompleted =
      this.habits[habitIndex].completions.length >=
      this.habits[habitIndex].targetFrequency;

    if (isCompleted) {
      console.log('Habit already completed.');
      return;
    } else {
      this.habits[habitIndex].completions;
      this.habits[habitIndex].completions.push(FinishedDate);
      this.habits[habitIndex].markCompleted();
      console.log('Successfully marked habit as done.');
    }
    this.saveToFile();
  }

  deleteHabit(habitIndex) {
    if (habitIndex > 0 && habitIndex <= this.habits.length) {
      this.habits.splice(habitIndex - 1, 1);
      console.log('Successfully deleted habit.');
    } else {
      console.log('Habit not found.');
    }
    this.saveToFile();
  }

  displayStatistics() {
    console.log('==================================================');

    console.log('Total Habits:', this.habits.length);
    console.log(
      'Active Habits:',
      this.habits.filter((habit) => !habit.finished).length
    );
    console.log(
      'Completed Habits:',
      this.habits.filter((habit) => habit.finished).length
    );
  }

  setReminder() {
    if (
      this.reminderStatus ||
      this.habits.filter((habit) => !habit.finished).length === 0
    )
      return;
    this.reminderStatus = true;
    setInterval(() => {
      this.habits.forEach((habit) => {
        if (habit.finished === false) {
          console.log('==================================================');
          console.log(`REMINDER: Dont Forget ${habit.name}!`);
          console.log('==================================================');
        }
      });
    }, REMINDER_INTERVAL);
  }

  saveToFile() {
    const data = {
      userProfile: {
        name: this.profile.name,
        age: this.profile.age,
        kelas: this.profile.kelas,
        joinDate: this.profile.joinDate
          ? new Date(this.profile.joinDate)
          : new Date(),
      },
      habits: this.habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        targetFrequency: habit.targetFrequency,
        completions: habit.completions.map((date) => date.toISOString()),
        createdAt: habit.createdAt.toISOString(),
        finished: habit.finished,
      })),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }
  clearAllData() {
    this.profile = {};
    this.habits = [];
    this.saveToFile();
  }
  demoLoop() {
    const activeHabits = this.habits.filter((habit) => !habit.finished);
    const doneHabits = this.habits.filter((habit) => habit.finished);
    if (!activeHabits.length && !doneHabits.length) {
      console.log('do not have any habits.');
      return;
    }

    console.log('========== List Active Habit with For ==========');

    if (activeHabits.length === 0) {
      console.log('do not have any active habits.');
    }
    for (let i = 0; i < activeHabits.length; i++) {
      console.log(activeHabits[i].name);
    }

    console.log('========== List Habit  with While ==========');
    if (doneHabits.length === 0) {
      console.log('do not have any done habits.');
    }
    let i = 0;
    while (i < doneHabits.length) {
      console.log(doneHabits[i].name);
      i++;
    }
  }
}

class Habit {
  constructor(id, name, targetFrequency, completions, createdAt, finished) {
    this.id = id ?? 0;
    this.name = name;
    this.targetFrequency = targetFrequency ?? 0;
    this.completions = completions ?? []; //Array of Date
    this.createdAt = createdAt ?? new Date();
    this.finished = finished ?? false;
  }

  // Check the habit is completed this week
  getCompletionsThisWeek() {
    const currentDate = new Date();
    const startOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );

    startOfWeek.setHours(0, 0, 0, 0);

    return this.completions.filter((date) => date >= startOfWeek);
  }

  // Check the habit is completed
  markCompleted() {
    if (this.getCompletionsThisWeek().length >= this.targetFrequency) {
      this.finished = true;
    }
  }
}

main();
