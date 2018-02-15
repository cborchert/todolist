import React, { Component } from "react";
import "./Tasklist.scss";

import { totalTasksTime, formatTime } from "../utilities/TaskOperations";
import Task from "./Task";

class Tasklist extends Component {
  constructor(props) {
    super(props);
    this.taskRefs = [];
    this.state = {
      focusOnTask: false,
      totalTime: 0
    };
    this.timerInterval = null;
  }

  timeTick() {
    this.setState({
      ...this.state,
      totalTime: totalTasksTime(this.props.tasks)
    });
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

  componentDidMount() {
    this.timerInterval = setInterval(this.timeTick.bind(this), 100);
  }

  componentWillUnmount() {
    clearInterval(this.timerInterval);
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
    const {
      tasks,
      changeTaskDetail,
      removeTask,
      updateStateWithValue
    } = this.props;
    return (
      <div className="tasklist">
        <div className="tasklist__header">
          <input
            className="tasklist__title"
            value={this.props.title}
            onChange={e => {
              updateStateWithValue("taskListName", e.target.value);
            }}
          />
          <span className="tasklist__time-tracked">
            {formatTime(this.state.totalTime)} tracked
          </span>
        </div>
        <div className="tasklist__tasks">
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
        </div>
        <button
          className="tasklist__add-task-button"
          onClick={this.addTaskButton.bind(this)}
        >
          Add Task
        </button>
      </div>
    );
  }
}
export default Tasklist;
