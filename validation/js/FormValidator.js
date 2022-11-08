class Validator {
  formIsValid = false;
  sentNumbers = [];
  validators = [];
  errorFields = [];
  allFields = [];
  _form = null;

  overlay = null;

  SMSSendButton = null;
  SMSSendAgain = null;
  SMSSent = false;
  SMSModal = null;
  SMSField = null;
  SMSCode = null;
  SMSTimerID = null;
  SMSTimer = 10;
  _SMSAgainClickable = "number-verify__again--active";
  _SMSField_ERROR = "number-verify__input--error";
  _VERIFY_VISIBLE = "number-verify--show";

  _ERROR = "form__input--error";
  _VALID = "form__input--valid";

  constructor(form, validators) {
    this._form = form;
    this._init(validators);
  }

  _init(validators) {
    validators.forEach((v, i) => {
      const { field, validator, init, event = "input" } = v;
      const input = this._form[field];

      if (input) {
        if (typeof validator === "function") {
          init?.call(this, input);
          input.dataset.id = i;

          this.validators.push({
            validator,
            event,
            input,
          });

          this.allFields.push(input);

          input.addEventListener(event, () =>
            this._eventHandler(input, validator)
          );
        } else {
          console.error(
            `[Warn] Field "${field}" validator must by a function.`
          );
        }
      } else {
        console.warn(`[Warn] Field "${field}" not found.`);
      }
    });

    this._appendSMSModal();

    this.allFields.push(this._form.querySelector(".send_order"));
    this.allFields.push(this._form.querySelector(".iti__selected-flag"));
    this.overlay = document.querySelector("#overlay");

    this._form.setAttribute("novalidate", true);
    this._form.setAttribute("action", "api.php");
    this._form.setAttribute("method", "POST");

    this._form.addEventListener("submit", (e) => this._submitHandler(e));
    this._enableAllFields();
  }

  _submitHandler(e) {
    if (!this.formIsValid) {
      e.preventDefault();

      this._sendLog(e.target);

      if (this._checkForm()) {
        this._sendVerifyRequest();
      } else {
        console.log("error");
      }
    }
  }

  _eventHandler(input, validator) {
    if (validator.call(this, input)) {
      this._success(input);
    } else {
      this._error(input);
    }
  }

  _checkForm() {
    for (const { input, validator } of this.validators) {
      if (validator.call(this, input)) this._success(input);
      else this._error(input);
    }

    if (!this.errorFields.length) return true;
    else return false;
  }

  _sendLog(form) {
    const body = new FormData(form);

    fetch("trl.php", {
      method: "POST",
      body,
    });
  }

  //************************************************

  _success(input) {
    this._setValid(input);
    const index = this._searchIndex(input);
    if (index !== -1) {
      this.errorFields.splice(index, 1);
    }
  }

  _error(input) {
    this._setError(input);
    const index = this._searchIndex(input);
    if (index === -1) this.errorFields.push(input);
  }

  _setError(input) {
    input.classList.remove(this._VALID);
    input.classList.add(this._ERROR);
  }

  _setValid(input) {
    input.classList.add(this._VALID);
    input.classList.remove(this._ERROR);
  }

  _searchIndex(input) {
    return this.errorFields.findIndex(
      ({ dataset }) => dataset.id === input.dataset.id
    );
  }

  _dispatchSubmit() {
    this.overlay.classList.add("show");
    this.formIsValid = true;
    this._form.submit();
  }

  _disableAllFields() {
    this.allFields.forEach((field) => (field.disabled = true));
  }

  _enableAllFields() {
    this.allFields.forEach((field) => (field.disabled = false));
  }

  _getCurrentPhone() {
    return this._form.phone2.value;
  }

  _sendVerifyRequest() {
    const currentPhone = this._getCurrentPhone();

    if (!this.sentNumbers.includes(currentPhone)) {
      const body = new FormData();

      body.append("phone", this._form.phone2.value);
      body.append("channel", "sms");
      body.append("type", "send");

      this._disableAllFields();
      this.sentNumbers.push(currentPhone);

      fetch("verify.php", {
        method: "POST",
        body,
      }).then((response) => this._showSMSModal());
    }
  }

  //************************************************
  _phoneIsValid() {
    return !!this._form.phone.dataset.valid;
  }
  //**********************SMS**************************

  _startSMSAgainTimer() {
    this.SMSSendAgain.disabled = true;
    this.SMSSendAgain.textContent = this.SMSTimer--;
    this.SMSSendAgain.classList.remove(this._SMSAgainClickable);

    this.SMSTimerID = setInterval(() => {
      if (this.SMSTimer > 0) {
        this.SMSSendAgain.textContent = this.SMSTimer--;
      } else {
        this._clearSMSAgainTimer();
      }
    }, 1000);
  }

  _clearSMSAgainTimer() {
    clearInterval(this.SMSTimerID);
    this.SMSTimerID = null;
    this.SMSSendAgain.disabled = false;
    this.SMSSendAgain.textContent = "Отправить СМС повторно";
    this.SMSSendAgain.classList.add(this._SMSAgainClickable);
    this.this.SMSTimer = 59;
  }

  _sendSMSCode() {
    const code = this.SMSField.value.trim();
    const body = new FormData();
    body.append("sms", code);

    if (code) {
      this._disableSMSModal();
      this.SMSField.classList.remove(this._SMSField_ERROR);

      fetch("verify.php", {
        method: "POST",
        body,
      })
        .then(() => {
          // this._dispatchSubmit();
        })
        .finally(() => {
          this._enableSMSModal();
        });
    } else {
      this.SMSField.classList.add(this._SMSField_ERROR);
    }
  }

  _appendSMSModal() {
    const changeNumber = this._createElement(
      "span.number-verify__change",
      null,
      ["Change number"]
    );

    const smsField = this._createElement("input.number-verify__input", {
      type: "text",
      placeholder: "Enter SMS code",
    });

    const sendSMS = this._createElement(
      "button.number-verify__send",
      { type: "button" },
      ["Send"]
    );

    const sendAgain = this._createElement("div.number-verify__again", null, [
      "Отправить СМС ",
    ]);

    const modal = this._createElement("div.number-verify", null, [
      this._createElement("div.number-verify__body", null, [
        this._createElement("div.number-verify__input-container", null, [
          smsField,
          sendAgain,
        ]),
        sendSMS,
        changeNumber,
      ]),
    ]);

    this._form.append(modal);

    this.SMSSendButton = sendSMS;
    this.SMSSendAgain = sendAgain;
    this.SMSModal = modal;
    this.SMSField = smsField;

    sendSMS.addEventListener("click", () => this._sendSMSCode());

    changeNumber.addEventListener("click", () => {
      this._closeSMSModal();
      this._enableAllFields();
    });

    smsField.addEventListener("keypress", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        this._sendSMSCode();
      }
    });

    smsField.addEventListener(
      "input",
      ({ target }) => (this.SMSCode = target.value.trim())
    );

    sendAgain.addEventListener('click', () => this._startSMSAgainTimer())
  }

  _createElement(selector, attributes, children = []) {
    const className = selector.split(".").splice(1).join(" ");
    const tagName = selector.split(".")[0];
    const element = document.createElement(tagName);

    className && (element.className = className);

    attributes &&
      Object.entries(attributes).forEach(([key, value]) =>
        element.setAttribute(key, value)
      );

    children.forEach((child) => element.append(child));

    return element;
  }

  _showSMSModal() {
    this.SMSModal.classList.add(this._VERIFY_VISIBLE);
    this.allFields.forEach((node) => node.setAttribute("tabindex", -1));

    this._startSMSAgainTimer();
    this._dispatchOpenModalEvent();
  }

  _closeSMSModal() {
    this.SMSModal.classList.remove(this._VERIFY_VISIBLE);
    this.allFields.forEach((node) => node.setAttribute("tabindex", 0));
    this.SMSField.value = "";
  }

  _disableSMSModal() {
    this.SMSField.disabled = true;
    this.SMSSendButton.disabled = true;
  }

  _enableSMSModal() {
    this.SMSField.disabled = false;
    this.SMSSendButton.disabled = false;
  }

  //**********************SMS end*************************

  //*********************Events***************************

  _dispatchOpenModalEvent() {
    this._form.dispatchEvent(this._createEvent("openmodal"));
  }

  _createEvent(event) {
    return new CustomEvent(event, {
      detail: { instance: this },
    });
  }

  //*********************Events end***********************

  //*********************Getters**************************
  get form() {
    return this._form;
  }
  //*********************Getters end**********************
}
