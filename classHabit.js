class habit {
  constructor(id, name, targetFrequency) {
    this.id = id;
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = []; // menghitung jumlah yang telah di kerjakan per habit ini
    this.createdAt = new Date();
    this.progress = 0;
  }

  // tandai selesai task per 1x habbit di lakukan
  markComplete() {
    this.completions.push(new Date());
  }

  //tugas yang selesai pada minggu ini
  getThisWeekCompletions() {
    const now = new Date();
    const StartOfWeek = new Date();
    StartOfWeek.setDate(now.getDate() - now.getDay()); // menggunakan tanggal saat ini di kurangi dengan hari saat ini (angka)
    return this.completions.filter((date) => date >= StartOfWeek);
  }

  isCompletedThisWeek() {
    return this.getThisWeekCompletions().length === this.target;
  }

  getProgressPercentage() {
    this.progress = Math.round((this.completions.length / this.target) * 100);
    return this.progress;
  }
  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }
}

export class HabitTracker {
  constructor(name, kelas, joinDate) {
    this.habits = []; // menyimpan array objek Habit

    // habits = [
    //   {
    //     id: 1,
    //     name: 'Mandi',
    //     target: 3,
    //     completions: [],
    //     createdAt: new Date(),
    //     progress: 0,
    //   },
    // ];
    this.reminderInterval = null;
    // this.loadFromFile();
  }

  addHabit(name, target) {
    const id = this.habits.length + 1; // generate id berdasarkan panjang array
    const newhabit = new habit(id, name, target);
    this.habits.push(newhabit);
    // this.saveToFile();
  }

  completeHabit(habitId) {
    const habit = this.habits.find((h) => h.id === habitId); //cari habit nya dari array
    if (habit) {
      habit.markComplete();
    } else {
      console.log('Habit tidak ditemukan.');
    }
  }
  deleteHabit(habitId) {
    this.habits = this.habits.filter((h) => h.id !== habitId);
  }

  displayProfile() {
    console.log('============================================');
    console.log('HABIT TRACKER CLI - CHALLENGE 3');
    console.log('============================================');
    console.log(`NAMA: ${this.userProfile.name}`);
    console.log(`KELAS: ${this.userProfile.kelas}`);
    console.log(`TANGGAL: ${new Date().toDateString()}`);
    console.log('============================================');
  }

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

  displayHabitsWithWhile() {
    let i = 0;
    while (i < this.habits.length) {
      displayHabits(i);
      i++;
    }
  }
  displayHabitsWithFor() {
    for (let i = 0; i < this.habits.length; i++) {
      displayHabits(i);
    }
  }
}

export function displayMenu() {
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
