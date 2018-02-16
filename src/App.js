import React, { Component } from "react";
import "./App.scss";

import Tasklist from "./components/Tasklist";
import { orderTasks } from "./utilities/TaskOperations";

class App extends Component {
  constructor(props) {
    super(props);

    //Debugging :)
    localStorage.clear();
    const localTasks = localStorage.getItem("tasks");
    const lastSeen = localStorage.getItem("lastSeen");
    const taskListName = localStorage.getItem("taskListName");
    const appName = localStorage.getItem("appName");
    this.state = {
      tasks: localTasks ? JSON.parse(localTasks) : [],
      projects: [],
      tags: [],
      taskLists: [],
      appName,
      taskListName,
      lastSeen
    };

    this.cacheInterval = null;
  }

  cacheLocally() {
    localStorage.setItem("tasks", JSON.stringify(this.state.tasks));
    localStorage.setItem("lastSeen", Date.now());
    localStorage.setItem("taskListName", this.state.taskListName);
    localStorage.setItem("appName", this.state.appName);
  }

  applyToTaskDefaults(newTask) {
    let task = {
      id: Date.now(),
      timeAdded: Date.now(),
      order: false,
      title: "",
      progress: 0,
      isCheckable: true,
      dateAdded: Date.now(),
      totalTime: 0,
      billableTime: 0,
      timers: [],
      tags: [],
      projects: [],
      taskLists: [],
      timelineStart: false,
      timelineEnd: false,
      parentTask: false,
      notes: []
    };

    Object.keys(newTask).forEach(key => {
      task[key] = newTask[key];
    });
    return task;
  }

  addTask(newTask) {
    newTask.order =
      typeof newTask.order !== "undefined"
        ? newTask.order + 1
        : this.state.tasks.length + 1;

    const task = this.applyToTaskDefaults(newTask);

    const tasks = orderTasks([
      ...this.state.tasks.slice(0, newTask.order),
      task,
      ...this.state.tasks.slice(newTask.order)
    ]);

    this.setState({
      ...this.state,
      tasks
    });
  }

  addTasks(newTasks) {
    if (newTasks.length === 0) {
      return;
    }

    let tasks = [];
    let stateTaskLength = this.state.tasks.length;
    newTasks.forEach(newTask => {
      let task = this.applyToTaskDefaults(newTask);
      tasks.push(task);
    });

    let stateTasks = [...this.state.tasks];

    tasks.forEach(task => {
      let order =
        typeof task.order !== "undefined" && task.order !== false
          ? task.order + 1
          : stateTasks.length + 1;
      stateTasks = [
        ...stateTasks.slice(0, order),
        task,
        ...stateTasks.slice(order)
      ];
    });

    this.setState({
      ...this.state,
      tasks: orderTasks(stateTasks)
    });
  }

  removeTask(taskId) {
    this.setState({
      ...this.state,
      tasks: orderTasks(this.state.tasks.filter(task => task.id !== taskId))
    });
  }

  reorderTask(taskId, newOrder) {
    const task = this.state.tasks.slice().filter(t => t.id === taskId)[0];
    if (typeof task === "undefined") {
      return;
    }

    const tasksWithoutTask = [
      ...this.state.tasks.slice(0, task.order),
      ...this.state.tasks.slice(task.order + 1)
    ];

    const tasks = orderTasks([
      ...tasksWithoutTask.slice(0, newOrder),
      task,
      ...tasksWithoutTask.slice(newOrder)
    ]);

    this.setState({
      ...this.state,
      tasks
    });
  }

  taskActiveTimer(task) {
    const activeTimers = task.timers.filter(
      timer => timer.startTime && !timer.endTime
    );
    if (activeTimers.length > 0) {
      return activeTimers.slice(0, 1)[0];
    } else {
      return false;
    }
  }

  taskTimerTime(task) {
    let activeTimer = this.taskActiveTimer(task);
    return activeTimer === false ? 0 : Date.now() - activeTimer.startTime;
  }

  changeTaskDetail(taskId, key, value) {
    this.setState({
      ...this.state,
      tasks: this.state.tasks.map((task, i) => {
        if (task.id === taskId) {
          task[key] = value;
        }
        return task;
      })
    });
    return taskId;
  }

  componentDidMount() {
    if (!this.state.lastSeen) {
      this.addTasks([
        {
          id: 1,
          title: "hello, world!"
        },
        {
          id: 2,
          title: "click this text and hit enter to add a task beneath it"
        },
        {
          id: 3,
          title: "click the x to the right to delete this task"
        },
        {
          id: 4,
          title:
            "toggle this task's timer by clicking the time button to the right"
        },
        {
          id: 5,
          title: "mark your progress by clicking the checkbox to the left"
        },
        {
          id: 6,
          title:
            "this app currently runs on local storage, so you can come back later :)"
        }
      ]);
    }
    this.cacheInterval = setInterval(this.cacheLocally.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.cacheInterval);
  }

  updateStateWithValue(key, value) {
    this.setState({
      ...this.state,
      [key]: value
    });
  }

  render() {
    return (
      <div className="app">
        <input
          className="app__title"
          value={this.state.appName}
          onChange={e => {
            this.updateStateWithValue("appName", e.target.value);
          }}
        />
        <Tasklist
          title={this.state.taskListName}
          tasks={this.state.tasks}
          addTask={this.addTask.bind(this)}
          changeTaskDetail={this.changeTaskDetail.bind(this)}
          removeTask={this.removeTask.bind(this)}
          updateStateWithValue={this.updateStateWithValue.bind(this)}
          reorderTask={this.reorderTask.bind(this)}
        />
        <div>
          <h5>shortcuts</h5>
          <ul>
            <li>up / down keys: navigate between tasks</li>
            <li>enter: new task after this task</li>
            <li>shift + enter: new task before this task</li>
            <li>shift + delete/backspace: delete task</li>
            <li>shift + right: indent task</li>
            <li>shift + left: unindent task</li>
            <li>shift + up: move task up list</li>
            <li>shift + down: move task down list</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
