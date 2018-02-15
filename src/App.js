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
    //TODO: Set defaults
    const order =
      typeof newTask.order !== "undefined"
        ? newTask.order + 1
        : this.state.tasks.length;

    const task = {
      id: Date.now(),
      timeAdded: Date.now(),
      order: order,
      title: newTask.title,
      progress: newTask.progress,
      isCheckable: newTask.isCheckable,
      dateAdded: newTask.dateAdded,
      totalTime: newTask.totalTime,
      billableTime: newTask.billableTime,
      timerStart: newTask.timerStart,
      tags: newTask.tags,
      projects: newTask.projects,
      taskLists: newTask.taskLists,
      timelineStart: newTask.timelineStart,
      timelineEnd: newTask.timelineEnd,
      subTasks: newTask.subTasks,
      notes: newTask.notes
    };

    this.setState({
      ...this.state,
      tasks: [
        ...this.state.tasks.slice(0, order),
        task,
        ...this.state.tasks.slice(order)
      ].map((task, i) => {
        task.order = i;
        return task;
      })
    });
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
    this.addTask({ title: "hello" });
  }

  render() {
    return (
      <div className="App">
        <h1>ToDo</h1>
        <Tasklist
          tasks={this.state.tasks}
          addTask={this.addTask.bind(this)}
          changeTaskDetail={this.changeTaskDetail.bind(this)}
        />
      </div>
    );
  }
}

export default App;
