import React, { Component } from "react";
import "./Tasklist.scss";

import Task from "./Task";

class Tasklist extends Component {
  constructor(props) {
    super(props);
    this.taskRefs = [];
    this.state = {
      focusOnTask: false
    };
  }

  newTask(order) {
    this.props.addTask({ title: "", order });
    this.setState({
      ...this.state,
      focusOnTask: order + 1
    });
  }

  addTaskButton(event) {
    const order = this.props.tasks.length - 1;
    this.newTask(order);
  }

  setRef(ref, id) {
    if (this.taskRefs.filter(taskRef => taskRef.id === id).length === 0) {
      this.taskRefs = [...this.taskRefs, { ref, id }];
    }
  }

  componentDidUpdate() {
    const focusOrder = this.state.focusOnTask;
    if (focusOrder !== false) {
      const focusId = this.props.tasks[focusOrder].id,
        focusTaskRef = this.taskRefs.filter(taskRef => taskRef.id === focusId);

      if (focusTaskRef.length > 0) {
        focusTaskRef[0].ref.focus();
        this.setState({
          ...this.state,
          focusOnTask: false
        });
      }
    }
  }

  render() {
    const { tasks, changeTaskDetail, removeTask } = this.props;
    return (
      <div>
        <h2>Tasklist</h2>
        {tasks.map((task, i) => {
          return (
            <Task
              key={i}
              task={task}
              changeTaskDetail={changeTaskDetail}
              newTask={this.newTask.bind(this)}
              setRef={this.setRef.bind(this)}
              removeTask={removeTask}
            />
          );
        })}
        <button onClick={this.addTaskButton.bind(this)}>Add Task</button>
      </div>
    );
  }
}
export default Tasklist;
