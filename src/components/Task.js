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
    //   this.state = {
    //     shouldFocus: props.shouldFocus,
    //     timerActive: taskActiveTimer(props.task) !== false,
    //     timerTime: taskTimerTime(props.task)
    //   };
    this.handleKeypress = this.handleKeypress.bind(this);
    //   this.timerInterval = null;
  }

  //   timerTick() {
  //     this.setState({
  //       ...this.state,
  //       timerActive: taskActiveTimer(this.props.task) !== false,
  //       timerTime: taskTimerTime(this.props.task)
  //     });
  //   }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeypress);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeypress);
  }

  handleKeypress(e) {
    var key = e.which || e.keyCode;

    if (this.inputRef === document.activeElement) {
      // const {
      //   newTask,
      //   setFocus,
      //   task,
      //   removeTask,
      //   reorderTask,
      //   changeTaskDetail
      // } = this.props;
      const {
        addTaskToView,
        order,
        task,
        removeTask,
        setFocusWithDirection,
        reorderTask
      } = this.props;
      const isShift = !!window.event.shiftKey;
      //Shift key events
      if (!isShift) {
        switch (key) {
          case 8:
            //delete
            // console.log("delete");
            if (task.title === "") {
              e.preventDefault();
              e.stopImmediatePropagation();
              removeTask(task.id);
            }
            break;
          case 13:
            //enter
            // console.log("enter");
            e.preventDefault();
            e.stopImmediatePropagation();
            //TODO: Check if child
            addTaskToView(order + 1);
            break;
          case 38:
            //up
            e.preventDefault();
            e.stopImmediatePropagation();
            setFocusWithDirection(task.id, -1);
            break;
          case 40:
            //down
            e.preventDefault();
            e.stopImmediatePropagation();
            setFocusWithDirection(task.id, 1);
            break;

          // case 9:
          //   //tab
          //   e.preventDefault();
          //   e.stopImmediatePropagation();
          //   changeTaskDetail(task.id, "isChild", true);
          //   break;

          default:
            //do nothing
            break;
        }
      }
      //   Shift + Keyevents;
      if (isShift) {
        switch (key) {
          case 13:
            //shift + enter
            e.preventDefault();
            e.stopImmediatePropagation();
            addTaskToView(order);
            break;
          case 8:
            //shift + delete
            e.preventDefault();
            e.stopImmediatePropagation();
            removeTask(task.id);
            break;
          case 38:
            //shift + up
            e.preventDefault();
            e.stopImmediatePropagation();
            reorderTask(order, order - 1);
            //reorder up
            break;
          case 40:
            //shift + down
            e.preventDefault();
            e.stopImmediatePropagation();
            reorderTask(order, order + 1);
            //reorder down
            break;
          //     case 37:
          //       //shift + left
          //       //unchild from parent
          //       e.preventDefault();
          //       e.stopImmediatePropagation();
          //       changeTaskDetail(task.id, "isChild", false);
          //       //do nothing
          //       break;
          //     case 39:
          //       //shift + right
          //       //do nothing
          //       //child to parent element
          //       e.preventDefault();
          //       e.stopImmediatePropagation();
          //       changeTaskDetail(task.id, "isChild", true);
          //       break;

          //     case 9:
          //       //shift+tab
          //       e.preventDefault();
          //       e.stopImmediatePropagation();
          //       changeTaskDetail(task.id, "isChild", false);
          //       break;
          default:
            //do nothing
            break;
        }
      }
    }
  }

  timerToggle(returnValue) {
    const { task, updateTask } = this.props,
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
    const progress = 0.5;
    const totalTime = task.totalTime + timeElapsed;
    if (returnValue) {
      return { timers, totalTime, progress };
    }
    updateTask(task.id, { timers, totalTime, progress });
  }

  progressToggle() {
    const { updateTask, task } = this.props;
    const progress = task.progress === 1 ? 0 : task.progress + 0.5;
    let newTask = { progress };
    if (progress === 1 && taskActiveTimer(task)) {
      console.log("test");
      newTask = { ...this.timerToggle(true), progress };
    }
    console.log(newTask);
    updateTask(task.id, newTask);
  }

  //   render() {
  //     const { task, changeTaskDetail, setRef, removeTask } = this.props,
  //       progressMarker =
  //         task.progress <= 0 ? "[ ]" : task.progress >= 1 ? "[X]" : "[/]",
  //       taskClasses = [
  //         //base class
  //         "task",
  //         //progress state
  //         task.progress <= 0
  //           ? "task--progress-inactive"
  //           : task.progress >= 1
  //             ? "task--progress-complete"
  //             : "task--progress-active",
  //         //timer state
  //         this.state.timerActive ? "task--timer-active" : "task--timer-inactive",
  //         this.inputRef === document.activeElement
  //           ? "task--input-active"
  //           : "task--input-inactive",
  //         task.isChild ? "task--is-child" : ""
  //       ],
  //       timeText = formatTime(task.totalTime + this.state.timerTime);
  //     return (
  //       <div className={taskClasses.join(" ")} draggable="true">
  //         <button
  //           className="task__progress-button"
  //           onClick={this.progressToggle.bind(this)}
  //         >
  //           {progressMarker}
  //         </button>
  //         <div className="task__name">
  //           <input
  //             className="task__name__input"
  //             value={task.title}
  //             onChange={e => {
  //               changeTaskDetail(task.id, "title", e.target.value);
  //             }}
  //             ref={input => {
  //               this.inputRef = input;
  //               setRef(input, task.id);
  //             }}
  //           />
  //           <div className="task__name__rendered">{task.title}</div>
  //         </div>

  //         <button
  //           className="task__timer-button"
  //           onClick={this.timerToggle.bind(this)}
  //         >
  //           <span className="task__time">
  //             <i className="fa fa-clock-o" />
  //             {" " + timeText}
  //           </span>
  //         </button>
  //         <button
  //           className="task__remove-button"
  //           onClick={e => {
  //             removeTask(task.order);
  //           }}
  //         >
  //           x
  //         </button>
  //       </div>
  //     );
  //   }

  //   render() {
  //     const { task, setRef, updateTask, removeTask } = this.props,
  //       progressMarker =
  //         task.progress <= 0 ? "[ ]" : task.progress >= 1 ? "[X]" : "[/]",
  //       taskClasses = [
  //         //base class
  //         "task",
  //         //progress state
  //         task.progress <= 0
  //           ? "task--progress-inactive"
  //           : task.progress >= 1
  //             ? "task--progress-complete"
  //             : "task--progress-active",
  //         // timer state
  //         // this.state.timerActive ? "task--timer-active" : "task--timer-inactive",
  //         this.inputRef === document.activeElement
  //           ? "task--input-active"
  //           : "task--input-inactive",
  //         task.isChild ? "task--is-child" : ""
  //       ],
  //       timeText = formatTime(task.totalTime);
  //     //   timeText = formatTime(task.totalTime + this.state.timerTime);
  //     return (
  //       <div className={taskClasses.join(" ")} draggable="true">
  //         <button
  //           className="task__progress-button"
  //           onClick={this.progressToggle.bind(this)}
  //         >
  //           {progressMarker}
  //         </button>
  //         <div className="task__name">
  //           <input
  //             className="task__name__input"
  //             value={task.title}
  //             onChange={e => {
  //               updateTask(task.id, "title", e.target.value);
  //             }}
  //             ref={input => {
  //               this.inputRef = input;
  //               setRef(input, task.id);
  //             }}
  //           />
  //           <div className="task__name__rendered">{task.title}</div>
  //         </div>

  //         <button
  //           className="task__timer-button"
  //           onClick={this.timerToggle.bind(this)}
  //         >
  //           <span className="task__time">
  //             <i className="fa fa-clock-o" />
  //             {" " + timeText}
  //           </span>
  //         </button>
  //         <button
  //           className="task__remove-button"
  //           onClick={e => {
  //             removeTask(task.id);
  //           }}
  //         >
  //           x
  //         </button>
  //       </div>
  //     );
  //   }
  render() {
    const {
      task,
      setRef,
      updateTask,
      removeTask,
      timerTime,
      timerActive
    } = this.props;
    const progressMarker =
      task.progress <= 0 ? "[ ]" : task.progress >= 1 ? "[X]" : "[/]";
    const taskClasses = [
      //base class
      "task",
      //progress state
      task.progress <= 0
        ? "task--progress-inactive"
        : task.progress >= 1
          ? "task--progress-complete"
          : "task--progress-active",
      //timer state
      timerActive ? "task--timer-active" : "task--timer-inactive",
      this.inputRef === document.activeElement
        ? "task--input-active"
        : "task--input-inactive",
      task.isChild ? "task--is-child" : ""
    ];
    //console.log(taskClasses);
    const timeValue = formatTime(task.totalTime + timerTime);
    return (
      <div className={taskClasses.join(" ")}>
        <button
          className="task__progress-button"
          onClick={this.progressToggle.bind(this)}
        >
          {progressMarker}
        </button>
        <div className="task__name">
          <input
            className="task__name__input"
            value={task.title}
            onChange={e => {
              updateTask(task.id, { title: e.target.value });
            }}
            ref={input => {
              this.inputRef = input;
              setRef(input, task.id);
            }}
          />
          <div className="task__name__rendered">{task.title}</div>
        </div>

        <button
          className="task__timer-button"
          onClick={e => {
            this.timerToggle();
          }}
        >
          <span className="task__time">
            <i className="fa fa-clock-o" />
            {timeValue}
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
