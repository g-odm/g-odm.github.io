document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".tails__swiper", {
    loop: true,
    speed: 1000,
    spaceBetween: 30,
    autoplay: { delay: 5000 },
    navigation: {
      nextEl: ".tails__button--next",
      prevEl: ".tails__button--prev",
    },
  });

  new Swiper(".testimonials__swiper", {
    loop: true,
    speed: 1000,
    spaceBetween: 30,
    autoplay: { delay: 5000 },
    navigation: {
      prevEl: ".t-swiper__button--prev",
      nextEl: ".t-swiper__button--next",
    },
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },

    breakpoints: {
      992: {
        slidesPerView: 3,
        slidesPerGroup: 3,
      },

      768: {
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
    },
  });

  // accordion
  const controls = document.getElementsByClassName("accordion__control");
  const content = document.getElementsByClassName("accordion__text");

  [...controls].forEach((control, index) => {
    setContentHeight();

    window.addEventListener("resize", setContentHeight);

    control.addEventListener("click", () => {
      control.classList.toggle("accordion__control--open");
      content[index].classList.toggle("accordion-text--show");
    });

    function setContentHeight() {
      const height = content[index].offsetHeight;
      content[index].style.marginTop = `-${height}px`;
    }
  });
  // accordion end

  // scroll
  Array.prototype.forEach.call(document.getElementsByTagName("a"), (button) => {
    if (!!button.hash) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        document
          .getElementById(button.hash.substring(1))
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
  });
  // scroll end

  const overlay = document.querySelector(".overlay");
  const openBtn = document.getElementById("open-menu");

  const hideOverlay = () => overlay.classList.remove("overlay--show");
  const showOverlay = () => overlay.classList.add("overlay--show");
  const disableScroll = () => (document.body.style.overflow = "hidden");
  const enableScroll = () => (document.body.style.overflow = "auto");

  openBtn.addEventListener("click", ({ currentTarget }) => {
    const opening = !!currentTarget.dataset.open;

    if (!opening) {
      openBtn.setAttribute("data-open", 1);
      disableScroll();
      showOverlay();
    } else {
      openBtn.setAttribute("data-open", "");
      enableScroll();
      hideOverlay();
    }
  });

  overlay.addEventListener("click", () => {
    openBtn.setAttribute("data-open", "");
    enableScroll();
    hideOverlay();
  });
});
