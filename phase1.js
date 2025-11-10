const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

const userProfile = {};

// const DataBase = {
//   name: 'alvin',
//   kelas: '1',
//   joinDate: 'Fri Nov 07 2025',
//   habits: [
//     {
//       id: 1,
//       name: 'Mandi',
//       target: 3,
//       completions: [],
//       createdAt: new Date(),
//       progress: 0,
//     },
//   ],
// };

async function profile() {
  userProfile.name = await askQuestion('What is your name? ');
  userProfile.old = await askQuestion('What is your old? ');
  userProfile.joinDate = new Date();
  userProfile.kelas = await askQuestion('What is your kelas? ');

  displayMenu();
}

const { HabitTracker, displayMenu } = require('./classHabit');

async function main() {
  await profile();
  console.log('userProfile', userProfile);
  const tracker = new HabitTracker();
  await handleMenu(tracker);
}

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

  // userProfile.updateStats(tracker.habits);
  await handleMenu(tracker); // Recursive call for loop
}

main();
