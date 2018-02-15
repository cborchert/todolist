import React, { Component } from "react";
import "./App.scss";

import Tasklist from "./components/Tasklist";

class App extends Component {
  constructor(props) {
    super(props);

    //Debugging :)
    //localStorage.clear();
    const localTasks = localStorage.getItem("tasks");
    const lastSeen = localStorage.getItem("lastSeen");
    this.state = {
      tasks: localTasks ? JSON.parse(localTasks) : [],
      projects: [],
      tags: [],
      taskLists: [],
      lastSeen
    };

    this.cacheInterval = null;
  }

  cacheLocally() {
    localStorage.setItem("tasks", JSON.stringify(this.state.tasks));
    localStorage.setItem("lastSeen", Date.now());
  }

  addTask(newTask) {
    const order =
      typeof newTask.order !== "undefined"
        ? newTask.order + 1
        : this.state.tasks.length + 1;
    let task = {
      id: Date.now(),
      timeAdded: Date.now(),
      order: order,
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

    this.setState({
      ...this.state,
      tasks: this.orderTasks([
        ...this.state.tasks.slice(0, order),
        task,
        ...this.state.tasks.slice(order)
      ])
    });
  }

  addTasks(newTasks) {
    if (newTasks.length === 0) {
      return;
    }

    let tasks = [];
    let stateTaskLength = this.state.tasks.length;
    newTasks.forEach(newTask => {
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
      tasks: this.orderTasks(stateTasks)
    });
  }

  removeTask(taskId) {
    this.setState({
      ...this.state,
      tasks: this.orderTasks(
        this.state.tasks.filter(task => task.id !== taskId)
      )
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

  taskTotalTime(task) {
    return task.totalTime + this.taskTimerTime(task);
  }

  orderTasks(taskList) {
    return taskList.map((task, i) => {
      task.order = i;
      return task;
    });
  }

  changeTaskDetail(taskId, key, value) {
    console.log(taskId, key, value);
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
          title: "save your progress by clicking the checkbox to the left"
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

  render() {
    return (
      <div className="app">
        <h1 className="app__title">ToDo</h1>
        <Tasklist
          tasks={this.state.tasks}
          addTask={this.addTask.bind(this)}
          changeTaskDetail={this.changeTaskDetail.bind(this)}
          removeTask={this.removeTask.bind(this)}
          taskActiveTimer={this.taskActiveTimer.bind(this)}
          taskTimerTime={this.taskActiveTimer.bind(this)}
          taskTotalTime={this.taskTotalTime.bind(this)}
        />
      </div>
    );
  }
}

export default App;
