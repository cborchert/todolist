import React, { Component } from "react";
import "./Task.scss";

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldFocus: props.shouldFocus,
      timerActive: this.activeTimer() !== false,
      timerTime: this.timerTime()
    };
    this.handleEnter = this.handleEnter.bind(this);
    this.timerInterval = null;
  }

  activeTimer() {
    const activeTimers = this.props.task.timers.filter(
      timer => timer.startTime && !timer.endTime
    );
    if (activeTimers.length > 0) {
      return activeTimers.slice(0, 1)[0];
    } else {
      return false;
    }
  }

  timerTime(task) {
    console.log("activeTimer", this.activeTimer().startTime);
    return this.activeTimer() === false
      ? 0
      : Date.now() - this.activeTimer().startTime;
  }

  timerTick() {
    this.setState({
      ...this.state,
      timerActive: this.activeTimer() !== false,
      timerTime: this.timerTime()
    });
  }

  formatTime(ms) {
    const s = Math.floor(ms / 1000) % 60,
      sec = s < 10 ? "0" + s : s,
      m = Math.floor(ms / 1000 / 60) % 60,
      min = m < 10 ? "0" + m : m,
      h = Math.floor(ms / 1000 / 60 / 60);
    return `${h}:${min}:${sec}`;
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
      timeElapsed = this.timerTime();
    if (this.activeTimer() === false) {
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
    if (task.progress === 0) {
      changeTaskDetail(task.id, "progress", 0.5);
    }
  }

  progressToggle() {
    const { changeTaskDetail, task } = this.props;
    const progress = task.progress === 1 ? 0 : task.progress + 0.5;
    changeTaskDetail(task.id, "progress", progress);
    if (progress === 1 && this.activeTimer()) {
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
      //   timeText = this.state.timerActive
      //     ? `${this.formatTime(task.totalTime)} + ${this.formatTime(
      //         this.state.timerTime
      //       )}`
      //     : this.formatTime(task.totalTime);
      timeText = this.formatTime(task.totalTime + this.state.timerTime);
    return (
      <div className={taskClasses.join(" ")}>
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
          <span className="task__time">{timeText}</span>
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
