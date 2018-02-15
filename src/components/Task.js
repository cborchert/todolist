import React, { Component } from "react";
import "./Task.scss";
import {
  totalTasksTime,
  taskTotalTime,
  taskTimerTime,
  taskActiveTimer,
  formatTime
} from "../utilities/TaskOperations";

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldFocus: props.shouldFocus,
      timerActive: taskActiveTimer(props.task) !== false,
      timerTime: taskTimerTime(props.task)
    };
    this.handleEnter = this.handleEnter.bind(this);
    this.timerInterval = null;
  }

  timerTick() {
    this.setState({
      ...this.state,
      timerActive: taskActiveTimer(this.props.task) !== false,
      timerTime: taskTimerTime(this.props.task)
    });
  }

  componentDidMount() {
    document.addEventListener("keypress", this.handleEnter);
    this.timerInterval = setInterval(this.timerTick.bind(this), 100);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleEnter);
    clearInterval(this.timerInterval);
  }

  handleEnter(e) {
    var key = e.which || e.keyCode;
    //onEnter
    if (key === 13) {
      if (this.inputRef === document.activeElement) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.props.newTask(this.props.task.order);
        this.inputRef.blur();
      }
    }
  }

  timerToggle() {
    const { task, changeTaskDetail } = this.props,
      currentTime = Date.now();
    let timers = task.timers.slice(),
      timeElapsed = taskTimerTime(task);
    if (taskActiveTimer(task) === false) {
      timers.push({ startTime: currentTime });
    } else {
      timers = timers.map(timer => {
        if (timer.startTime && !timer.endTime) {
          timer.endTime = currentTime;
        }
        return timer;
      });
    }
    changeTaskDetail(task.id, "timers", timers);
    changeTaskDetail(task.id, "totalTime", task.totalTime + timeElapsed);
    if (task.progress === 0 || task.progress === 1) {
      changeTaskDetail(task.id, "progress", 0.5);
    }
  }

  progressToggle() {
    const { changeTaskDetail, task } = this.props;
    const progress = task.progress === 1 ? 0 : task.progress + 0.5;
    changeTaskDetail(task.id, "progress", progress);
    if (progress === 1 && taskActiveTimer(task)) {
      this.timerToggle();
    }
  }

  render() {
    const { task, changeTaskDetail, setRef, removeTask } = this.props,
      progressMarker =
        task.progress <= 0 ? "[ ]" : task.progress >= 1 ? "[X]" : "[/]",
      taskClasses = [
        //base class
        "task",
        //progress state
        task.progress <= 0
          ? "task--progress-inactive"
          : task.progress >= 1
            ? "task--progress-complete"
            : "task--progress-active",
        //timer state
        this.state.timerActive ? "task--timer-active" : "task--timer-inactive"
      ],
      timerButtonText = "timer:",
      timeText = formatTime(task.totalTime + this.state.timerTime);
    return (
      <div className={taskClasses.join(" ")} draggable="true">
        <button
          className="task__progress-button"
          onClick={this.progressToggle.bind(this)}
        >
          {progressMarker}
        </button>
        <input
          className="task__name"
          value={task.title}
          onChange={e => {
            changeTaskDetail(task.id, "title", e.target.value);
          }}
          ref={input => {
            this.inputRef = input;
            setRef(input, task.id);
          }}
        />

        <button
          className="task__timer-button"
          onClick={this.timerToggle.bind(this)}
        >
          <span className="task__time">
            <i className="fa fa-clock-o" />
            {" " + timeText}
          </span>
        </button>
        <button
          className="task__remove-button"
          onClick={e => {
            removeTask(task.id);
          }}
        >
          x
        </button>
      </div>
    );
  }
}

export default Task;
