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
      <div>
        <div>This is the modal</div>
        <div>
          <input
            className={nameOk ? "" : "error"}
            ref={input => {
              this.name = input;
            }}
            placeholder="view title"
            onChange={this.verifyForm.bind(this)}
          />
        </div>
        <div>
          <input
            className={filterOk ? "" : "error"}
            ref={input => {
              this.filter = input;
            }}
            placeholder="view filter"
            onChange={this.verifyForm.bind(this)}
          />
        </div>
        {formValid ? (
          ""
        ) : (
          <div>
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

        <div>
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
