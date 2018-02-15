import React, { Component } from "react";
import "./Task.scss";

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldFocus: props.shouldFocus
    };
    this.handleEnter = this.handleEnter.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keypress", this.handleEnter);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleEnter);
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

  render() {
    const { task, changeTaskDetail, setRef, removeTask } = this.props,
      progressMarker =
        task.progress <= 0 ? "[ ]" : task.progress >= 1 ? "[X]" : "[/]";
    return (
      <div>
        <button
          onClick={e => {
            changeTaskDetail(
              task.id,
              "progress",
              task.progress === 1 ? 0 : task.progress + 0.5
            );
          }}
        >
          {progressMarker}
        </button>
        <input
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
          onClick={e => {
            removeTask(task.id);
          }}
        >
          x
        </button>
        <span />
      </div>
    );
  }
}

export default Task;
