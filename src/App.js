import React, { Component } from "react";
import findIndex from "lodash/findIndex";
import "./App.scss";

import Tasklist from "./components/Tasklist";
import View from "./components/View";
import { orderTasks } from "./utilities/TaskOperations";

class App extends Component {
  constructor(props) {
    super(props);

    //Debugging :)
    localStorage.clear();
    const localTasks = localStorage.getItem("tasks");
    const lastSeen = localStorage.getItem("lastSeen");
    const taskListName = localStorage.getItem("taskListName");
    const appName = localStorage.getItem("appName");
    const views = localStorage.getItem("views");

    this.state = {
      tasks: localTasks ? JSON.parse(localTasks) : [],
      views: views
        ? views
        : [
            {
              title: "all tasks",
              id: -1,
              tag: "",
              filterString: "",
              tasks: [],
              permanent: true
            }
          ],
      appName: appName ? appName : "to do (click to edit)",
      taskListName: taskListName ? taskListName : "all tasks (click to edit)",
      lastSeen
    };

    this.cacheInterval = null;
  }

  cacheLocally() {
    localStorage.setItem("tasks", JSON.stringify(this.state.tasks));
    localStorage.setItem("lastSeen", Date.now());
    localStorage.setItem("taskListName", this.state.taskListName);
    localStorage.setItem("appName", this.state.appName);
    localStorage.setItem("views", this.state.views);
  }

  applyToTaskDefaults(newTask) {
    let task = {
      id: Date.now(),
      timeAdded: Date.now(),
      order: false,
      title: "",
      progress: 0,
      isCheckable: true,
      dateAdded: Date.now(),
      totalTime: 0,
      billableTime: 0,
      timers: [],
      tags: [],
      projects: [],
      taskLists: [],
      timelineStart: false,
      timelineEnd: false,
      parentTask: false,
      notes: []
    };

    Object.keys(newTask).forEach(key => {
      task[key] = newTask[key];
    });
    return task;
  }

  addTask(newTask) {
    newTask.order =
      typeof newTask.order !== "undefined"
        ? newTask.order + 1
        : this.state.tasks.length + 1;

    const task = this.applyToTaskDefaults(newTask);

    const tasks = orderTasks([
      ...this.state.tasks.slice(0, newTask.order),
      task,
      ...this.state.tasks.slice(newTask.order)
    ]);

    this.setState(
      {
        ...this.state,
        tasks
      },
      this.reconcileViews
    );
  }

  addTasks(newTasks) {
    if (newTasks.length === 0) {
      return;
    }

    let tasks = [];
    let stateTaskLength = this.state.tasks.length;
    newTasks.forEach(newTask => {
      let task = this.applyToTaskDefaults(newTask);
      tasks.push(task);
    });

    let stateTasks = [...this.state.tasks];

    tasks.forEach(task => {
      let order =
        typeof task.order !== "undefined" && task.order !== false
          ? task.order + 1
          : stateTasks.length + 1;
      stateTasks = [
        ...stateTasks.slice(0, order),
        task,
        ...stateTasks.slice(order)
      ];
    });

    this.setState(
      {
        ...this.state,
        tasks: orderTasks(stateTasks)
      },
      this.reconcileViews
    );
  }

  removeTask(taskId) {
    this.setState(
      {
        ...this.state,
        tasks: this.state.tasks.filter(task => task.id !== taskId)
      },
      this.reconcileViews
    );
  }

  reorderTask(taskId, newOrder) {
    const task = this.state.tasks.slice().filter(t => t.id === taskId)[0];
    if (typeof task === "undefined") {
      return;
    }

    const tasksWithoutTask = [
      ...this.state.tasks.slice(0, task.order),
      ...this.state.tasks.slice(task.order + 1)
    ];

    const tasks = orderTasks([
      ...tasksWithoutTask.slice(0, newOrder),
      task,
      ...tasksWithoutTask.slice(newOrder)
    ]);

    this.setState({
      ...this.state,
      tasks
    });
  }

  taskActiveTimer(task) {
    const activeTimers = task.timers.filter(
      timer => timer.startTime && !timer.endTime
    );
    if (activeTimers.length > 0) {
      return activeTimers.slice(0, 1)[0];
    } else {
      return false;
    }
  }

  taskTimerTime(task) {
    let activeTimer = this.taskActiveTimer(task);
    return activeTimer === false ? 0 : Date.now() - activeTimer.startTime;
  }

  changeTaskDetail(taskId, key, value) {
    this.setState({
      ...this.state,
      tasks: this.state.tasks.map((task, i) => {
        if (task.id === taskId) {
          task[key] = value;
        }
        return task;
      })
    });
    return taskId;
  }

  componentDidMount() {
    if (!this.state.lastSeen) {
      this.addTasks([
        {
          id: 1,
          title: "hello, world! #ab"
        },
        {
          id: 2,
          title: "#cd click this text and hit enter to add a task beneath it"
        },
        {
          id: 3,
          title: "#ef click the x to the right to delete this task"
        },
        {
          id: 4,
          title:
            "#cd #ef toggle this task's timer by clicking the time button to the right"
        },
        {
          id: 5,
          title:
            "#ab #cd#ef mark your progress by clicking the checkbox to the left"
        },
        {
          id: 6,
          title:
            "#ab #cd this app currently runs on local storage, so you can come back later :)"
        }
      ]);
    }
    this.cacheInterval = setInterval(this.cacheLocally.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.cacheInterval);
  }

  updateStateWithValue(key, value) {
    this.setState({
      ...this.state,
      [key]: value
    });
  }

  updateView(viewId, viewValues) {
    const { views } = this.state;
    const index = findIndex(views, v => v.id === viewId);
    const view = { ...views[index], ...viewValues };
    this.setState({
      ...this.state,
      views: [...views.slice(0, index), view, ...views.slice(index + 1)]
    });
  }

  updateTask(taskId, taskValues) {
    const { tasks } = this.state;
    const index = findIndex(tasks, t => t.id === taskId);
    const task = { ...tasks[index], ...taskValues };
    this.setState({
      ...this.state,
      tasks: [...tasks.slice(0, index), task, ...tasks.slice(index + 1)]
    });
  }

  applyTagFilter(tasks, filterString) {
    //if no filter is to be applied, it gets all tasks
    if (!filterString) {
      return tasks;
    }
    let filters = [];
    //Look for any #tags separated by space. Allows for #abc#def to be counted as one tag
    const regex = /[#][^\s]+/g;
    let match;
    while ((match = regex.exec(filterString))) {
      let filter = match[0];
      //Parse tags like #tag1#tag2 into #tag1 #tag2
      const regex2 = /[#][^\s^#]+/g;
      let filterParts = [];
      let match2;
      while ((match2 = regex2.exec(filter))) {
        filterParts.push(match2[0]);
      }
      filters.push(filterParts);
    }
    //TODO Clean this up
    const filteredTasks = tasks.filter(task => {
      let includeTask = false;
      filters.forEach(filterPart => {
        let matchesFilter = true;
        //Must match each filter part
        filterPart.forEach(filter => {
          let strPos = task.title.indexOf(filter);
          if (strPos >= 0) {
            let char = task.title[strPos + filter.length];
            //Make sure that it's the end of the filter application
            //if the next character isn't the end of the string, a space, or another hashtag, it doesn't work
            if (typeof char === "undefined" || char === " " || char === "#") {
              matchesFilter = matchesFilter && true;
            }
          } else {
            //no match
            matchesFilter = false;
          }
        });
        if (matchesFilter) {
          includeTask = true;
        }
      });
      return includeTask;
    });
    return filteredTasks;
  }

  reconcileViews() {
    this.state.views.forEach(view => {
      this.reconcileViewTasks(view);
    });
  }

  reconcileViewTasks(view) {
    //start with the task ids included
    let viewTasks = view.tasks;
    //then add any tasks that happen to fit the filter
    let filteredTasks = this.applyTagFilter(
      this.state.tasks,
      view.filterString
    );

    //Remove any tasks that are already there.
    let tasks = [
      ...viewTasks,
      ...filteredTasks
        .filter(task => viewTasks.indexOf(task.id) === -1)
        .map(task => task.id)
    ];
    view = {
      ...view,
      tasks
    };

    this.setState({
      views: [...this.state.views.filter(v => v.id !== view.id), view]
    });
  }

  getViewTasks(view) {
    let tasks = [];
    let viewTasks = [...view.tasks];
    viewTasks.forEach(taskId => {
      let matchedTasks = this.state.tasks.filter(t => t.id === taskId);
      if (matchedTasks.length > 0) {
        tasks.push(matchedTasks[0]);
      }
    });
    return tasks;
  }

  render() {
    const { views, tasks } = this.state;
    return (
      <div className="app">
        <input
          className="app__title"
          value={this.state.appName}
          onChange={e => {
            this.updateStateWithValue("appName", e.target.value);
          }}
        />
        {views.map((view, i) => {
          return (
            <View
              key={"view-" + i}
              view={view}
              tasks={this.getViewTasks(view)}
              updateView={this.updateView.bind(this)}
              removeTask={this.removeTask.bind(this)}
              updateTask={this.updateTask.bind(this)}
              addTask={this.addTask.bind(this)}
            />
          );
        })}
        <div className="app__help">
          <h5 className="app__help-title">shortcuts</h5>
          <ul>
            <li>
              <b>up</b> / <b>down</b> keys: navigate between tasks
            </li>
            <li>
              <b>enter</b>: new task after this task
            </li>
            <li>
              <b>shift + enter</b>: new task before this task
            </li>
            <li>
              <b>shift + delete/backspace</b>: delete task
            </li>
            <li>
              <b>delete/backspace</b> on empty task: delete task
            </li>
            <li>
              <b>shift + right</b> or <b>tab</b>: indent task
            </li>
            <li>
              <b>shift + left</b> or <b>shift + tab</b>: unindent task
            </li>
            <li>
              <b>shift + up</b>: move task up list
            </li>
            <li>
              <b>shift + down</b>: move task down list
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
