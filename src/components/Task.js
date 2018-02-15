import React, { Component } from "react";
import "./Task.scss";

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldFocus: props.shouldFocus
    };
  }

  //Todo: remove event listener on unmount
  componentDidMount() {
    document.addEventListener("keyup", e => {
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
    });
  }

  render() {
    const { task, changeTaskDetail, setRef } = this.props;
    return (
      <div>
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
      </div>
    );
  }
}

export default Task;
