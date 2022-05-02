// Taken from https://daily-dev-tips.com/posts/vanilla-javascript-modal-pop-up/

const modals = document.querySelectorAll("[data-modal]");

function Modal(element) {
  let self = this;

  self.element = element;

  element.classList.add("modal");

  self.open = function() {
    element.classList.add("open");
    for (let exit of element.querySelectorAll(".modal-exit")) {
      exit.addEventListener("click", function (event) {
        event.preventDefault();
        self.close();
      });
    }
  };

  self.close = function() {
    element.classList.remove("open");
    self.onClose();
  };

  self.onClose = function() {
  }

  return self;
}
