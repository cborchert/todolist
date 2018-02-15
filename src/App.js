import React, { Component } from "react";
import "./App.scss";

import Tasklist from "./components/Tasklist";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tasks: [],
      projects: [],
      tags: [],
      taskLists: []
    };
  }

  addTask(newTask) {
    const order =
      typeof newTask.order !== "undefined"
        ? newTask.order + 1
        : this.state.tasks.length;

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
    this.addTask({ title: "hello" });
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
