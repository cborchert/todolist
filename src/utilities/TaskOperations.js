function taskActiveTimer(task) {
  if (!task || !task.timers) {
    return false;
  }
  const activeTimers = task.timers.filter(
    timer => timer.startTime && !timer.endTime
  );
  if (activeTimers.length > 0) {
    return activeTimers.slice(0, 1)[0];
  } else {
    return false;
  }
}

function taskTimerTime(task) {
  let activeTimer = taskActiveTimer(task);
  return activeTimer === false ? 0 : Date.now() - activeTimer.startTime;
}

function taskTotalTime(task) {
  return task.totalTime + taskTimerTime(task);
}

function orderTasks(taskList) {
  return taskList.map((task, i) => {
    task.order = i;
    return task;
  });
}

function totalTasksTime(tasks) {
  let time = 0;
  tasks.forEach(task => {
    time += taskTotalTime(task);
  });
  return time;
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000) % 60,
    sec = s < 10 ? "0" + s : s,
    m = Math.floor(ms / 1000 / 60) % 60,
    min = m < 10 ? "0" + m : m,
    h = Math.floor(ms / 1000 / 60 / 60);
  return `${h}:${min}:${sec}`;
}

export {
  orderTasks,
  taskTotalTime,
  taskTimerTime,
  taskActiveTimer,
  totalTasksTime,
  formatTime
};
