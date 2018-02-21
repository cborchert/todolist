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
    updateView(this.props.view.id, { tasks: tasklist }, () => {
      addTask(task);
      this.setFocus(task.id);
    });
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
    const { view, updateView, updateTask } = this.props;
    const tasks = view.tasks;
    //Check if it's a child.
    const task = this.props.tasks[order];

    let low = 0,
      high = tasks.length - 1,
      reorderChildren = false,
      parentIndex,
      parent;
    if (task && typeof task.parent !== "undefined" && task.parent !== false) {
      reorderChildren = true;
      //This is childed.
      //get lower and higher limits
      parentIndex = tasks.indexOf(task.parent);
      parent = this.props.tasks[parentIndex];

      low = high = parentIndex + 1;
      parent.children.forEach(child => {
        let current = tasks.indexOf(child);
        if (current > high) {
          high = current;
        }
      });
    } else {
      //if it's a parent or a normal task

      let direction = newOrder - order > 0 ? 1 : -1;
      //if it's moving down and has children, it should move at least the length of it's children
      if (task.children && direction === 1) {
        newOrder += task.children.length;
      }

      //Make sure that the place it's moving into isn't childed
      let canMove = false;
      let didSkip = false;
      //find the next place that is not someone else's child
      //and set newOrder to that
      while (!canMove) {
        canMove = true;
        //check if newOrder is a child
        //if so, move one more in that direction
        let replacedTask = this.props.tasks[newOrder];

        console.log("canMove? replacedTask parent", replacedTask);
        if (replacedTask && replacedTask.parent) {
          canMove = false;
          newOrder = newOrder + direction;
        }

        // let nextOrder = newOrder + 1;
        // if (nextOrder > high) {
        //   nextOrder = low;
        // }
        // if (nextOrder < low) {
        //   nextOrder = high;
        // }
        // let replacedTask = this.props.tasks[newOrder];
        // let afterReplacedTask = this.props.tasks[nextOrder];
        // //the next task or the one after it is a child
        // if (
        //   //comment this out allows us to move down correctly
        //   (afterReplacedTask && afterReplacedTask.parent) ||
        //   //commenting this out allows us to move down correctly
        //   (replacedTask && replacedTask.parent)
        // ) {
        //   newOrder = newOrder + direction;
        //   canMove = false;
        //   didSkip = true;
        // }
      }
      // if (didSkip) {
      //   // newOrder = newOrder - direction;
      // }
    }

    if (newOrder < low) {
      newOrder = high;
    }
    if (newOrder > high) {
      newOrder = low;
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

    if (reorderChildren) {
      let parentChildren = [...parent.children],
        childIndex = parentChildren.indexOf(task.id),
        diff = newOrder - order,
        newChildIndex = childIndex + diff;
      parentChildren = [
        ...parentChildren.slice(0, childIndex),
        ...parentChildren.slice(childIndex + 1)
      ];
      parentChildren = [
        ...parentChildren.slice(0, newChildIndex),
        task.id,
        ...parentChildren.slice(newChildIndex)
      ];
      updateTask(parent.id, { children: [...parentChildren] });
    }

    updateView(view.id, { tasks: newTasks });
    updateTask(task.id);
    this.setFocus(taskId);
  }

  childTask(order) {
    const { tasks, setTaskAsChild } = this.props;
    //look for the parent id
    if (
      typeof tasks[order].parent !== "undefined" &&
      tasks[order].parent !== false
    ) {
      //You've already got a daddy.
      return;
    }
    if (
      typeof tasks[order].children !== "undefined" &&
      tasks[order].children.length > 0
    ) {
      //You've already got kids!
      return;
    }
    const childId = tasks[order].id;
    let index = order,
      parentId = false;
    while (--index > -1 && parentId === false) {
      let currentTask = tasks[index];
      let currentParent = currentTask.parent;
      if (typeof currentParent === "undefined" || currentParent === false) {
        parentId = currentTask.id;
      }
    }
    if (parentId !== false) {
      setTaskAsChild(parentId, childId);
    }
  }

  componentDidMount() {
    this.timerInterval = setInterval(this.tick.bind(this), 500);
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

  render() {
    const {
      tasks,
      updateView,
      view,
      updateTask,
      addTask,
      unsetTaskAsChild
    } = this.props;
    // const views = tasks.map((task, i) => <div key={i}>{task.title}</div>);
    const renderedTasks = tasks.map((task, i) => {
      return (
        <Task
          key={"view-" + view.id + "__task-" + i}
          order={i}
          task={task}
          isChild={typeof task.parent !== "undefined" && task.parent !== false}
          addTask={addTask}
          addTaskToView={this.addTaskToView.bind(this)}
          updateTask={updateTask}
          setRef={this.setRef.bind(this)}
          removeTask={this.removeTask.bind(this)}
          setFocusWithDirection={this.setFocusWithDirection.bind(this)}
          timerTime={taskTimerTime(task)}
          reorderTask={this.reorderTask.bind(this)}
          timerActive={taskActiveTimer(task) !== false}
          childTask={this.childTask.bind(this)}
          unChildTask={unsetTaskAsChild}
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

          <div className="view__subheader">
            <span className="view__default-filter">
              automatically tracks{view.filterString === ""
                ? " all tasks"
                : ` tasks marked ${view.filterString}`}
            </span>
            <span className="view__time-tracked">
              {formatTime(this.state.totalTime)} tracked
            </span>
          </div>
        </div>

        <div className="view__tasks">{renderedTasks}</div>
        <button
          className="view__add-task-button"
          onClick={this.handleAddTaskButtonClick.bind(this)}
        >
          add task
        </button>
      </div>
    );
  }
}
export default View;
