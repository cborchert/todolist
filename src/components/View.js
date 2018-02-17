import React, { Component } from "react";
import "./View.scss";

import {
  totalTasksTime,
  formatTime,
  taskTimerTime,
  taskActiveTimer
} from "../utilities/TaskOperations";
import Task from "./Task";

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusOnTask: false,
      totalTime: 0
    };
    this.taskRefs = [];
    this.timerInterval = null;
  }

  tick() {
    this.setState({
      ...this.state,
      totalTime: totalTasksTime(this.props.tasks)
    });
  }

  addTaskToView(order, task) {
    const { view, addTask, updateView } = this.props;
    task = task || { id: Date.now(), title: "" };
    order =
      typeof order !== "undefined" && order !== false
        ? order
        : view.tasks.length;
    let tasklist = [
      ...view.tasks.slice(0, order),
      task.id,
      ...view.tasks.slice(order)
    ];
    updateView(this.props.view.id, { tasks: tasklist });
    addTask(task);
    this.setFocus(task.id);
  }

  setFocus(id) {
    this.setState({
      focusOnTask: id
    });
  }

  setFocusWithDirection(id, direction) {
    const { tasks } = this.props.view;
    let index = tasks.indexOf(id);
    if (index === -1) {
      return;
    }
    let newIndex = index + direction;
    newIndex = newIndex < 0 ? tasks.length - 1 : newIndex;
    newIndex = newIndex >= tasks.length ? 0 : newIndex;
    let focusId = tasks[newIndex];
    this.setState({
      focusOnTask: focusId
    });
  }

  handleAddTaskButtonClick(event) {
    this.addTaskToView();
  }

  setRef(ref, id) {
    //Get rid of old ref if it exists
    this.taskRefs = this.taskRefs.filter(taskRef => taskRef.id !== id);
    this.taskRefs = [...this.taskRefs, { ref, id }];
  }

  removeTask(id) {
    const { view, removeTask, updateView } = this.props;
    let focusIndex = this.props.view.tasks.indexOf(id) - 1;
    focusIndex = focusIndex < 0 ? 0 : focusIndex;
    let focusId = this.props.view.tasks[focusIndex];
    let taskList = [
      ...view.tasks.slice(0, focusIndex),
      ...view.tasks.slice(focusIndex + 1)
    ];

    removeTask(id);
    this.setFocus(focusId);
  }

  reorderTask(order, newOrder) {
    const { view, updateView } = this.props;
    const tasks = view.tasks;
    if (newOrder < 0) {
      newOrder = tasks.length - 1;
    }
    if (newOrder >= tasks.length) {
      newOrder = 0;
    }
    const taskId = tasks[order];
    if (typeof taskId === "undefined") {
      return;
    }
    let tempTasks = [...tasks.slice(0, order), ...tasks.slice(order + 1)];
    let newTasks = [
      ...tempTasks.slice(0, newOrder),
      taskId,
      ...tempTasks.slice(newOrder)
    ];

    updateView(view.id, { tasks: newTasks });
    this.setFocus(taskId);
  }

  componentDidMount() {
    this.timerInterval = setInterval(this.tick.bind(this), 100);
  }

  componentWillUnmount() {
    clearInterval(this.timerInterval);
  }

  componentDidUpdate() {
    const focusId = this.state.focusOnTask;
    if (focusId !== false) {
      const matches = this.taskRefs.filter(r => r.id === focusId);
      if (matches.length < 1) {
        this.setState({
          ...this.state,
          focusOnTask: false
        });
        return;
      }
      matches[0].ref && matches[0].ref.focus();
      this.setState({
        ...this.state,
        focusOnTask: false
      });
    }
  }

  //   render() {
  //     const { tasks, changeTaskDetail, updateStateWithValue } = this.props;
  //     return (
  //       <div className="view">
  //         <div className="view__header">
  //           <input
  //             className="view__title"
  //             value={this.props.title}
  //             onChange={e => {
  //               updateStateWithValue("taskListName", e.target.value);
  //             }}
  //           />
  //           <span className="view__time-tracked">
  //             {formatTime(this.state.totalTime)} tracked
  //           </span>
  //         </div>
  //         <div className="view__tasks">
  //           {tasks.map((task, i) => {
  //             return (
  //               <Task
  //                 key={i}
  //                 task={task}
  //                 changeTaskDetail={changeTaskDetail}
  //                 newTask={this.newTask.bind(this)}
  //                 setFocus={this.setFocus.bind(this)}
  //                 setFocusById={this.setFocusById.bind(this)}
  //                 setRef={this.setRef.bind(this)}
  //                 removeTask={this.removeTask.bind(this)}
  //                 reorderTask={this.reorderTask.bind(this)}
  //               />
  //             );
  //           })}
  //         </div>
  //         <button
  //           className="view__add-task-button"
  //           onClick={this.addTaskButton.bind(this)}
  //         >
  //           Add Task
  //         </button>
  //       </div>
  //     );
  //   }
  render() {
    const { tasks, updateView, view, updateTask, addTask } = this.props;
    // const views = tasks.map((task, i) => <div key={i}>{task.title}</div>);
    const renderedTasks = tasks.map((task, i) => {
      return (
        <Task
          key={"view-" + view.id + "__task-" + i}
          order={i}
          task={task}
          addTask={addTask}
          addTaskToView={this.addTaskToView.bind(this)}
          updateTask={updateTask}
          setRef={this.setRef.bind(this)}
          removeTask={this.removeTask.bind(this)}
          setFocusWithDirection={this.setFocusWithDirection.bind(this)}
          timerTime={taskTimerTime(task)}
          reorderTask={this.reorderTask.bind(this)}
          timerActive={taskActiveTimer(task) !== false}
        />
      );
    });
    return (
      <div className="view">
        <div className="view__header">
          <input
            className="view__title"
            value={view.title}
            onChange={e => {
              updateView(view.id, { title: e.target.value });
            }}
          />
          <span className="view__time-tracked">
            {formatTime(this.state.totalTime)} tracked
          </span>
        </div>
        <div className="view__tasks">{renderedTasks}</div>
        <button
          className="view__add-task-button"
          onClick={this.handleAddTaskButtonClick.bind(this)}
        >
          Add Task
        </button>
      </div>
    );
  }
}
export default View;
