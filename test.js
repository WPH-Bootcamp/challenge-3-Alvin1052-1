let userProfile = {
  name: 'John Doe',
  joinDate: new Date(),
  totalHabits: 0,
  completedThisWeek: 0,
  updateStats(habits) {
    console.log(habits);
    this.totalHabits += 1;
  },
  getDaysJoined() {
    console.log(this.joinDate.getDay());
  },
};

// userProfile.getDaysJoined();
// userProfile.updateStats('belajar');

// console.log(userProfile);

const dateTime = new Date('2025-11-09T09:27:37.247Z');

console.log('dayOfWeek', dayOfWeek);
console.log(startOfWeek.getDate());

console.log('startOfWeek', startOfWeek);
console.log('dateTime', dateTime);

console.log(startOfWeek < dateTime);
