import React, { Component } from "react";
import findIndex from "lodash/findIndex";
import "./App.scss";

import Tasklist from "./components/Tasklist";
import View from "./components/View";
import AddViewModal from "./components/AddViewModal";
import { orderTasks } from "./utilities/TaskOperations";

class App extends Component {
  constructor(props) {
    super(props);
    this.v = "v0.0.1";
    //Debugging :)
    localStorage.clear();
    const localTasks = localStorage.getItem("tasks" + this.v);
    const lastSeen = localStorage.getItem("lastSeen" + this.v);
    const appName = localStorage.getItem("appName" + this.v);
    const views = localStorage.getItem("views" + this.v);
    this.state = {
      tasks: localTasks ? JSON.parse(localTasks) : [],
      views: views
        ? JSON.parse(views)
        : [
            {
              title: "all tasks",
              id: -1,
              tag: "",
              filterString: "",
              tasks: [],
              permanent: true
            },
            {
              title: "#a",
              id: 1,
              tag: "",
              filterString: "#a",
              tasks: [],
              permanent: true
            },
            {
              title: "#b",
              id: 2,
              tag: "",
              filterString: "#b",
              tasks: [],
              permanent: true
            }
          ],
      appName: appName ? appName : "to do (click to edit)",
      lastSeen,
      activeViewId: 1,
      addViewModalOpen: false
    };

    this.cacheInterval = null;
  }

  cacheLocally() {
    localStorage.setItem("tasks" + this.v, JSON.stringify(this.state.tasks));
    localStorage.setItem("lastSeen" + this.v, Date.now());
    localStorage.setItem("appName" + this.v, this.state.appName);
    localStorage.setItem("views" + this.v, JSON.stringify(this.state.views));
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
      parent: false,
      projects: [],
      taskLists: [],
      timelineStart: false,
      timelineEnd: false,
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
    const tasks = [...this.state.tasks, task];

    this.setState(
      {
        ...this.state,
        tasks
      },
      this.reconcileActiveView
    );
  }

  addTasks(newTasks, callback = () => {}) {
    if (newTasks.length === 0) {
      return;
    }

    let tasks = [];
    let stateTaskLength = this.state.tasks.length;
    newTasks.forEach(newTask => {
      let task = this.applyToTaskDefaults(newTask);
      tasks.push(task);
    });
    this.setState(
      {
        ...this.state,
        tasks
      },
      () => {
        this.reconcileActiveView();
        callback();
      }
    );
  }

  removeTask(taskId) {
    this.setState(
      {
        ...this.state,
        tasks: this.state.tasks
          .filter(task => task.id !== taskId)
          .map(task => ({
            ...task,
            children: task.children
              ? task.children.filter(childId => childId !== taskId)
              : []
          }))
      },
      this.reconcileActiveView
    );
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
      // let tasks = [];
      // for (let i = 1; i <= 100; i++) {
      //   tasks.push({ id: i, title: i });
      // }
      let tasks = [
        {
          id: 1,
          title: "why hello! i didn't see you there! 👋 ",
          order: 1
        },
        {
          id: 2,
          title: "#a click this text and hit enter to add a task beneath it",
          order: 2
        },
        {
          id: 3,
          title: "click the x to the right to delete this task",
          order: 3
        },
        {
          id: 4,
          title:
            "toggle this task's timer by clicking the time button to the right",
          order: 4
        },
        {
          id: 5,
          title: "mark your progress by clicking the checkbox to the left",
          order: 5
        },
        {
          id: 6,
          title:
            "this app runs on local storage, so you can come back later 🤞😉",
          order: 6
        },
        {
          id: 7,
          title:
            "p.s. try using the shorcuts listed below... try tab, shift + up, etc!!",
          order: 7
        }
      ];
      this.addTasks(tasks, this.reconcileViews.bind(this));
    }
    this.cacheInterval = setInterval(this.cacheLocally.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.cacheInterval);
  }

  updateStateWithValue(key, value) {
    this.setState(
      {
        ...this.state,
        [key]: value
      },
      this.reconcileActiveView
    );
  }

  updateView(viewId, viewValues, callback = () => {}) {
    this.setState(
      {
        ...this.state,
        views: this.state.views.map(
          view => (view.id === viewId ? { ...view, ...viewValues } : view)
        )
      },
      callback
    );
  }

  updateTask(taskId, taskValues) {
    this.setState(
      {
        ...this.state,
        tasks: this.state.tasks.map(
          t => (t.id !== taskId ? t : { ...t, ...taskValues })
        )
      },
      this.reconcileActiveView
    );
  }

  unsetTaskAsChild(child) {
    this.setState(
      {
        ...this.state,
        tasks: this.state.tasks.map(task => {
          if (task.id === child) {
            task.parent = false;
          }
          if (task.children) {
            task.children = task.children.filter(childId => childId !== child);
          }
          return task;
        })
      },
      this.reconcileActiveView
    );
  }

  setTaskAsChild(parent, child) {
    this.setState({
      ...this.state,
      tasks: this.state.tasks.map(task => {
        if (!task.children) {
          task.children = [];
        }
        if (task.id === parent && task.children.indexOf(child) === -1) {
          task.children.push(child);
        }
        if (task.id === child) {
          task.parent = parent;
        }
        return task;
      })
    });
  }

  //TODO: Technically, we only need the id's out of this match
  applyTagFilter(tasks, filterString) {
    // console.log("applying filters");
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
            } else {
              matchesFilter = false;
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

    //Add parents of child tasks
    let filteredTasksParentsOnly = [];
    filteredTasks.forEach(task => {
      if (task.parent) {
        //check whether the parent is in the list already
        // console.log("task is a child!", task);
        if (
          filteredTasksParentsOnly.filter(t => t.id === task.parent).length <= 0
        ) {
          //if not, add the parent to the list
          const parent = tasks.filter(t => t.id === task.parent)[0];
          if (parent) {
            filteredTasksParentsOnly.push(parent);
          }
        }
      } else {
        // console.log("task is a parent");
        //if it's not a child, go ahead and leave it in the list
        filteredTasksParentsOnly.push(task);
      }
    });

    // console.log(filterString, filteredTasksParentsOnly);
    return filteredTasksParentsOnly;
  }

  reconcileViews() {
    let views = [];
    this.state.views.forEach(view => {
      let reconciledView = this.reconcileViewTasks(view);
      views.push(reconciledView);
    });

    this.setState({
      ...this.state,
      views
    });
  }

  reconcileActiveView() {
    this.setState({
      ...this.state,
      views: this.state.views.map(
        view =>
          view.id === this.state.activeViewId
            ? { ...this.reconcileViewTasks(view) }
            : view
      )
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

    let children = [];
    //Remove any tasks that are already there.
    let tasks = [
      ...viewTasks,
      ...filteredTasks
        .filter(task => viewTasks.indexOf(task.id) === -1)
        .map(task => task.id)
    ].filter(taskId => {
      let keep = false;
      this.state.tasks.forEach(stateTask => {
        if (stateTask.id === taskId) {
          keep = true;
        }
      });
      return keep;
    });
    let parents = [];
    //Remove/Reorder children
    tasks.forEach(taskId => {
      let task = this.state.tasks.filter(
        stateTask => stateTask.id === taskId
      )[0];
      if (task && task.children && task.children.length > 0) {
        task.children.forEach(child => {
          //Remove children from list
          let childIndex = tasks.indexOf(child);
          if (childIndex > -1) {
            tasks = [
              ...tasks.slice(0, childIndex),
              ...tasks.slice(childIndex + 1)
            ];
          }
        });
        let parentIndex = tasks.indexOf(taskId);
        if (parentIndex > -1) {
          tasks = [
            ...tasks.slice(0, parentIndex + 1),
            ...task.children,
            ...tasks.slice(parentIndex + 1)
          ];
        }
      }
    });

    view = {
      ...view,
      tasks
    };
    return view;
  }

  getViewTasks(view) {
    let tasks = [];
    let viewTasks = [...view.tasks];
    viewTasks.forEach(taskId => {
      let matchedTasks = [...this.state.tasks].filter(t => t.id === taskId);
      if (matchedTasks.length > 0) {
        tasks.push(matchedTasks[0]);
      }
    });
    return tasks;
  }

  toggleActiveView() {
    const currentIndex = findIndex(this.state.views, {
      id: this.state.activeViewId
    });
    const nextIndex =
      currentIndex + 1 >= this.state.views.length ? 0 : currentIndex + 1;
    const activeViewId = this.state.views[nextIndex].id;

    this.setState(
      {
        ...this.state,
        activeViewId
      },
      this.reconcileActiveView
    );
  }

  toggleAddViewModal() {
    this.setState({
      ...this.state,
      addViewModalOpen: !this.state.addViewModalOpen
    });
  }

  addView(view) {
    console.log(view);
  }

  render() {
    const { views, addViewModalOpen } = this.state;
    const view = views.filter(view => view.id === this.state.activeViewId)[0];
    const renderedView = !view ? (
      ""
    ) : (
      <View
        view={view}
        tasks={this.getViewTasks(view)}
        updateView={this.updateView.bind(this)}
        removeTask={this.removeTask.bind(this)}
        updateTask={this.updateTask.bind(this)}
        addTask={this.addTask.bind(this)}
        setTaskAsChild={this.setTaskAsChild.bind(this)}
        unsetTaskAsChild={this.unsetTaskAsChild.bind(this)}
      />
    );
    const addViewModal = !addViewModalOpen ? (
      ""
    ) : (
      <AddViewModal addView={this.addView.bind(this)} />
    );
    return (
      <div className="app">
        <input
          className="app__title"
          value={this.state.appName}
          onChange={e => {
            this.updateStateWithValue("appName", e.target.value);
          }}
        />
        {renderedView}
        <div className="app__toggle-active-view">
          <button onClick={this.toggleActiveView.bind(this)}>
            Toggle active view
          </button>
        </div>
        <div className="app__toggle-active-view">
          <button onClick={this.toggleAddViewModal.bind(this)}>Add View</button>
        </div>
        {addViewModal}

        <div className="app__help">
          <h5 className="app__help-title">shortcuts</h5>
          <ul>
            <li>
              <b>up</b> / <b>down</b> keys: navigate between tasks
            </li>
            <li>
              <b>enter</b>: new task after this task
            </li>
            {/* <li>
              <b>shift + enter</b>: new task before this task
            </li> */}
            <li>
              <b>ctrl/⌘ + shift + delete/backspace</b>: delete task
            </li>
            <li>
              <b>delete/backspace</b> on empty task: delete task
            </li>
            <li>
              <b>tab</b>: indent task
            </li>
            <li>
              <b>shift + tab</b>: unindent task
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
