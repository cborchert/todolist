import React, { Component } from "react";
import "./AddViewModal.scss";

class AddViewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameOk: false,
      filterOk: false
    };
  }

  verifyForm() {
    this.setState({
      nameOk: this.verifyName(this.name.value),
      filterOk: this.verifyFilter(this.filter.value)
    });
  }

  verifyName(name) {
    return name.length > 0;
  }

  verifyFilter(filter) {
    if (filter.length === 0) {
      return false;
    }
    const filterParts = filter.split(" ");
    let isOkay = true;
    filterParts.forEach(fp => {
      if (fp.indexOf("#") !== 0 || fp.replace(/#/g, "").length === 0) {
        isOkay = false;
      }
    });
    return isOkay;
  }

  onSubmit() {
    const { nameOk, filterOk } = this.state;
    if (nameOk && filterOk) {
      this.props.addView({
        title: this.name.value,
        filterString: this.filter.value
      });
    }
  }

  render() {
    const { nameOk, filterOk } = this.state;
    const formValid = nameOk && filterOk;
    return (
      <div className="app-view-modal">
        <button
          className="app-view-modal__close"
          onClick={this.props.closeModal}
        >
          x
        </button>
        <h3 className="app-view-modal__header">add new view</h3>
        <div className="app-view-modal__body">
          <div className="app-view-modal__input-container">
            <label className="app-view-modal__input-label" for="new-view-name">
              view name
            </label>
            <input
              className={
                nameOk ? "app-view-modal__input" : "app-view-modal__input error"
              }
              ref={input => {
                this.name = input;
              }}
              name="new-view-name"
              placeholder="view title"
              onChange={this.verifyForm.bind(this)}
            />
          </div>
          <div className="app-view-modal__input-container">
            <label
              className="app-view-modal__input-label"
              for="new-view-filter"
            >
              view filter
            </label>
            <input
              className={
                filterOk
                  ? "app-view-modal__input"
                  : "app-view-modal__input error"
              }
              ref={input => {
                this.filter = input;
              }}
              name="new-view-filter"
              placeholder="view filter"
              onChange={this.verifyForm.bind(this)}
            />
          </div>
        </div>
        <div>
          {formValid ? (
            ""
          ) : (
            <div className="app-view-modal__errors">
              {nameOk ? "" : <p>You must include a title</p>}
              {filterOk ? (
                ""
              ) : (
                <p>
                  You must include at least one filter, and filters must begin
                  with a #
                </p>
              )}
            </div>
          )}
        </div>

        <div className="app-view-modal__footer">
          <button
            type="button"
            onClick={this.onSubmit.bind(this)}
            disabled={!formValid}
          >
            Create View
          </button>
        </div>
      </div>
    );
  }
}

export default AddViewModal;
