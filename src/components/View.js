import React, { Component } from "react";
import "./View.scss";

import { totalTasksTime, formatTime } from "../utilities/TaskOperations";
import Task from "./Task";

class View extends Component {
  //   constructor(props) {
  //     super(props);
  //     this.taskRefs = [];
  //     this.state = {
  //       focusOnTask: false,
  //       totalTime: 0
  //     };
  //     this.timerInterval = null;
  //   }

  //   timeTick() {
  //     this.setState({
  //       ...this.state,
  //       totalTime: totalTasksTime(this.props.tasks)
  //     });
  //   }

  //   newTask(order) {
  //     this.props.addTask({ title: "", order });
  //     this.setFocus(order + 1);
  //   }

  //   setFocus(order) {
  //     this.setState({
  //       ...this.state,
  //       focusOnTask: order
  //     });
  //   }

  //   setFocusById(taskId) {
  //     const task = this.props.tasks.filter(t => t.id === taskId)[0];
  //     if (!task) {
  //       return;
  //     }
  //     this.setFocus(task.order);
  //   }

  //   addTaskButton(event) {
  //     const order = this.props.tasks.length - 1;
  //     this.newTask(order);
  //   }

  //   setRef(ref, id) {
  //     //Get rid of old ref if it exists
  //     this.taskRefs = this.taskRefs.filter(taskRef => taskRef.id !== id);
  //     this.taskRefs = [...this.taskRefs, { ref, id }];
  //   }

  //   removeTask(order) {
  //     const task = this.props.tasks[order];
  //     if (typeof task === "undefined") {
  //       return;
  //     }
  //     this.props.removeTask(task.id);
  //   }

  //   reorderTask(order, newOrder) {
  //     if (newOrder < 0) {
  //       newOrder = this.props.tasks.length - 1;
  //     }
  //     if (newOrder >= this.props.tasks.length) {
  //       newOrder = 0;
  //     }
  //     const task = this.props.tasks[order];
  //     if (typeof task === "undefined") {
  //       return;
  //     }
  //     this.props.reorderTask(task.id, newOrder);
  //   }

  //   componentDidMount() {
  //     this.timerInterval = setInterval(this.timeTick.bind(this), 100);
  //   }

  //   componentWillUnmount() {
  //     clearInterval(this.timerInterval);
  //   }

  //   componentDidUpdate() {
  //     const focusOrder = this.state.focusOnTask;
  //     if (focusOrder !== false) {
  //       //This assumes that
  //       const focusTask = this.props.tasks[focusOrder];
  //       if (typeof focusTask === "undefined") {
  //         this.setState({
  //           ...this.state,
  //           focusOnTask: false
  //         });
  //         return;
  //       }
  //       const focusId = focusTask.id;
  //       const focusTaskRef = this.taskRefs.filter(
  //         taskRef => taskRef.id === focusId
  //       );

  //       if (focusTaskRef.length > 0) {
  //         focusTaskRef[0].ref.focus();
  //       }
  //       this.setState({
  //         ...this.state,
  //         focusOnTask: false
  //       });
  //     }
  //   }

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
    const { tasks, updateView, view } = this.props;

    return (
      <div className="view">
        <div className="view__header">
          <input
            className="view__title"
            value={view.title}
            onChange={e => {
              updateView(view.id, "title", e.target.value);
            }}
          />
        </div>
        <div className="view__tasks">
          {tasks.map((task, i) => <div key={i}>{task.title}</div>)}
        </div>
      </div>
    );
  }
}
export default View;
