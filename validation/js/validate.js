(async () => {
  intlTelInputGlobals.loadUtils("validation/js/utils.js");

  let countryCode = "pl";

  try {
    const response = await fetch("https://ipinfo.io?token=77b0a33921dd63");

    if (response.ok) {
      const { country } = await response.json();
      countryCode = country;
    }
  } catch (e) {}

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="overlay">
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>        
    </div>`
  );

  function nameValidator({ value }) {
    const regex = /[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF]+$/;
    return value.trim().length > 2 && regex.test(value.trim());
  }

  const allForms = [];
  const validators = [
    {
      field: "first_name",
      validator: nameValidator,
    },

    {
      field: "last_name",
      validator: nameValidator,
    },

    {
      field: "email",
      validator({ value }) {
        const regex =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return regex.test(value.trim());
      },
    },

    {
      field: "phone",
      validator: ({ dataset }) => !!dataset.valid,
      init(phone) {
        const { phone2, phone_code } = this.form;

        const iti = intlTelInput(phone, {
          initialCountry: "auto",
          geoIpLookup: (success) => success(countryCode),
          separateDialCode: true,
          coutryCode: true,
        });

        phone.addEventListener("countrychange", () => {
          const { dialCode } = iti.getSelectedCountryData();
          phone_code.value = dialCode;
        });

        phone.type = "tel";
        phone.dataset.valid = "";
        phone.addEventListener("input", () => {
          phone.dataset.valid = iti.isValidNumber() ? 1 : "";
          phone2.value = iti.getNumber();
        });
      },
    },
  ];

  Array.prototype.forEach.call(document.querySelectorAll(".form"), (form) => {
    const formInstance = new Validator(form, validators);

    allForms.push(formInstance);

    form.addEventListener('openmodal', e => {
      console.log(e)
      console.log(e.detail)
    })
  });
})();
