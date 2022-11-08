$(document).ready(function () {
  $("head").append(
    `<style>
        .lds-ring {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
        .lds-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 64px;
          height: 64px;
          margin: 8px;
          border: 8px solid #fff;
          border-radius: 50%;
          animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: #fff transparent transparent transparent;
        }
        .lds-ring div:nth-child(1) {
          animation-delay: -0.45s;
        }
        .lds-ring div:nth-child(2) {
          animation-delay: -0.3s;
        }
        .lds-ring div:nth-child(3) {
          animation-delay: -0.15s;
        }
        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        #overlay {
          background: rgba(0, 0, 0, .4);
          position: fixed;
          z-index: 9999999999999;
          width: 100%;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          display: none;
        }

        #overlay.show {
            display: flex;
        }

        .btn:disabled, .btn[disabled] {
          background-color: #ccc;
          pointer-events: none;
        }
  
        .form-group {
          position: relative;
        }
  
        .form-group .message {
          position: absolute;
          bottom: -23px;
          font-size: 14px;
          display: block;
        }
  
        .message.error, .error {
          color: red;
        }
  
        .err_validation_fmt {
          border-color: red !important;
        }
  
        .valid_validation_fmt {
          border-color: green !important;
        }
  
  
        .form-group.success input  {
          border: 1px solid rgb(107, 212, 107)!important;
        }
        .form-group input.success {
          border: 1px solid rgb(107, 212, 107)!important;
        }
  
        /* .form-control input.error, */
        .form-group.error input
         {
          border: 1px solid red!important;
        }
  
        .form-group input:focus {
          outline: 0;
          border: 1px solid #ccc;
        }
  
        .hide {
          display: none;
        }

      </style>`
  );

  $("body").append(
    '<div id="overlay"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div></div>'
  );

  const check1 = $("#politics-4401");
  const check2 = $("#over-4401");

  [check1, check2].forEach((check) => {
    check.on("change", isCheck);
  });

  function isCheck(e) {
    if (!$(e.currentTarget).is(":checked")) {
      $(this).parents(".checkbox-wrap").addClass("checkbox-wrap--error");
    } else {
      $(e.currentTarget)
        .parents(".checkbox-wrap")
        .removeClass("checkbox-wrap--error");
    }
  }

  function sendLog(form) {
    var xhr = new XMLHttpRequest();

    var body = $(form).serialize();
    xhr.open("POST", "trl.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(body);
  }

  const setSuccess = (element) => {
    const inputControl = element.parentElement;
    // inputControl.classList.add("success");
    inputControl.classList.remove("error");

    return true;
  };

  let iti = [];
  let countryCode;

  $.get(
    "https://ipinfo.io?token=77b0a33921dd63",
    function () {},
    "jsonp"
  ).always(function (resp) {
    countryCode = resp && resp.country ? resp.country : "";

    // switch (countryCode) {
    //   case "UA":
    //     countryCode = "US";
    // }

    $(".iti__flag_add").addClass("iti__" + resp.country.toLowerCase());
    inetlStart();
  });

  function inetlStart() {
    let inputs = document.querySelectorAll("input[name=phone]");

    for (let i = 0; i < inputs.length; i++) {
      iti[i] = intlTelInput(inputs[i], {
        utilsScript: "validate/js/utils.js",
        initialCountry: "auto",
        separateDialCode: true,
        coutryCode: true,
        geoIpLookup: function (success, failure) {
          countryCode.toLowerCase();
          success(countryCode);
        },
      });

      inputs[i].setAttribute("data-iti", i);
      inputs[i].setAttribute("type", "tel");
      inputs[i].setAttribute("required", "true");
      inputs[i].addEventListener("input", function () {
        let p = ~~this.getAttribute("data-iti");

        if (iti[p].isValidNumber() && /^[+-]?\d+$/.test(iti[p].getNumber())) {
          this.classList.remove("err_validation_fmt");
          this.classList.add("valid_validation_fmt");
          $(".phone2").val(iti[p].getNumber());
        } else {
          this.classList.add("err_validation_fmt");
          this.classList.remove("valid_validation_fmt");
        }
      });
    }
  }

  function submitForm(t) {
    t.parents("form").submit();
    $("#overlay").addClass("show");
    t.attr("disabled", true);
  }

  $("form .send_order").click(function (e) {
		const form = $(this).parents('form');
    sendLog(form);
    e.preventDefault();
    if (checkForm($(this))) {
      submitForm($(this));
    }
  });
  let addOnce = true;

  $("form input").on("input", function () {
    let name = $(this).attr("name");
    if (name == "phone") {
      let it = $(this).attr("data-iti");
      $(".phone2").val(iti[it].getNumber());
      let countryData = iti[it].getSelectedCountryData();
      $("#phone_code").val(countryData["dialCode"]);
    }
    addOnce ? $(this).attr("autocomplete", "on") : "";
    checkForm($(this), name);
  });

  function checkForm(_this, check) {
    let isValid = true;
    let regLetters = /[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF]+$/;
    _this
      .parents("form")
      .find("input")
      .each(function () {
        addOnce ? $(this).attr("autocomplete", "on") : "";
        let name = $(this).attr("name");
        if (name == "first_name") {
          if ($(this).val().length < 2 || !regLetters.test($(this).val())) {
            isValid = false;
            if (check == undefined || check == "first_name") {
              $(this)
                .removeClass("valid_validation_fmt")
                .addClass("err_validation_fmt");
            }
          } else {
            $(this)
              .removeClass("err_validation_fmt")
              .addClass("valid_validation_fmt");
            setSuccess($(this)[0]);
          }
        }
        if (name == "last_name") {
          if ($(this).val().length < 2 || !regLetters.test($(this).val())) {
            isValid = false;
            if (check == undefined || check == "last_name") {
              $(this)
                .removeClass("valid_validation_fmt")
                .addClass("err_validation_fmt");
            }
          } else {
            $(this)
              .removeClass("err_validation_fmt")
              .addClass("valid_validation_fmt");
            setSuccess($(this)[0]);
          }
        }
        if (name == "email") {
          let re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          if (!re.test($(this).val())) {
            isValid = false;
            if (check == undefined || check == "email") {
              $(this)
                .removeClass("valid_validation_fmt")
                .addClass("err_validation_fmt");
            }
          } else {
            $(this)
              .removeClass("err_validation_fmt")
              .addClass("valid_validation_fmt");
            setSuccess($(this)[0]);
          }
        }
        if (name == "phone") {
          _this = $(this);
          if (!_this.hasClass("valid_validation_fmt")) {
            isValid = false;
          }
          setTimeout(function () {
            if (!_this.hasClass("valid_validation_fmt")) {
              isValid = false;
              if (check == undefined || check == "phone") {
                _this.addClass("err_validation_fmt");
              }
            }
          }, 1);
        }

        if (name === "over" || name === "politics") {
          if (!$(this).is(":checked")) {
            isValid = false;
          }
        }
      });
    addOnce = false;
    return isValid;
  }
});
