import React, { Component } from "react";
import "./AppModal.scss";

class ActiveViewModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="app-modal app-modal">
        <button
          className="app-modal__close app-modal__close"
          onClick={this.props.closeModal}
        >
          x
        </button>
        <h3 className="app-modal__header app-modal__header">switch to view</h3>
        <div className="app-modal__body">
          <ul className="app-modal__selector">
            {this.props.views.map((view, i) => (
              <li
                className="app-modal__selector__item"
                key={i}
                onClick={() => {
                  this.props.setActiveView(view.id);
                }}
              >
                {view.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default ActiveViewModal;
