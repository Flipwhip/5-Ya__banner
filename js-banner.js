let dragObjects = document.querySelectorAll(".draggable-object");
let dropContainer = document.querySelector("#drop-point");
let currentElement = null;
let moveElement = false;
let initialX = 0, initialY = 0;
let offsetX = 0, offsetY = 0;
let droppedElements = [];

let requiredSequence = ["молоко", "бананы", "ананас"];

let styleSheet = document.createElement("style");
styleSheet.textContent = `
@-webkit-keyframes beat {
  0% { -webkit-transform: scale(1); transform: scale(1); }
  50% { -webkit-transform: scale(1.2); transform: scale(1.2); }
  100% { -webkit-transform: scale(1); transform: scale(1); }
}

@-moz-keyframes beat {
  0% { -moz-transform: scale(1); transform: scale(1); }
  50% { -moz-transform: scale(1.2); transform: scale(1.2); }
  100% { -moz-transform: scale(1); transform: scale(1); }
}

@-o-keyframes beat {
  0% { -o-transform: scale(1); transform: scale(1); }
  50% { -o-transform: scale(1.2); transform: scale(1.2); }
  100% { -o-transform: scale(1); transform: scale(1); }
}

@keyframes beat {
  0% { 
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    -o-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.2);
    -moz-transform: scale(1.2);
    -ms-transform: scale(1.2);
    -o-transform: scale(1.2);
    transform: scale(1.2);
  }
  100% {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    -o-transform: scale(1);
    transform: scale(1);
  }
}

.next-element {
  cursor: pointer;
  -webkit-animation: beat 1.5s infinite;
  -moz-animation: beat 1.5s infinite;
  -o-animation: beat 1.5s infinite;
  animation: beat 1.5s infinite;
}
`;

document.head.appendChild(styleSheet);

function highlightNextElement() {
  dragObjects.forEach(element => {
    element.classList.remove("next-element");
  });

  if (droppedElements.length < requiredSequence.length) {
    let nextElementAlt = requiredSequence[droppedElements.length];
    dragObjects.forEach(element => {
      if (element.getAttribute("alt") === nextElementAlt && !droppedElements.includes(element)) {
        element.classList.add("next-element");
      }
    });
  }
}

function canDragElement(element) {
  let alt = element.getAttribute("alt");
  let currentStep = droppedElements.length;
  return alt === requiredSequence[currentStep];
}

function saveInitialStyles(element) {
  return {
    left: element.style.left,
    right: element.style.right,
    top: element.style.top,
    bottom: element.style.bottom,
    position: element.style.position,
    parentElement: element.parentElement
  };
}

function dragStart(e) {
  if (droppedElements.length >= 3) {
    return;
  }

  let targetElement = e.target;
  if (!canDragElement(targetElement)) {
    return;
  }

  e.preventDefault();
  moveElement = true;
  currentElement = targetElement;

  currentElement.classList.remove("next-element");

  if (e.type === "mousedown") {
    initialX = e.clientX;
    initialY = e.clientY;
  } else if (e.type === "touchstart") {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
  }

  let rect = currentElement.getBoundingClientRect();
  offsetX = initialX - rect.left;
  offsetY = initialY - rect.top;

  currentElement.initialWidth = currentElement.offsetWidth;
  currentElement.initialHeight = currentElement.offsetHeight;
  currentElement.initialStyles = saveInitialStyles(currentElement);

  currentElement.style.position = "fixed";
  currentElement.style.zIndex = "1000";
  currentElement.style.transform = "scale(1.5)";
  currentElement.style.transition = "transform 0.2s";

  currentElement.style.left = rect.left / 16 + "rem";
  currentElement.style.top = rect.top / 16 + "rem";
}

function move(e) {
  if (moveElement && currentElement) {
    e.preventDefault();
    let clientX, clientY;

    if (e.type === "mousemove") {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.type === "touchmove") {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    currentElement.style.left = (clientX - offsetX) / 16 + "rem";
    currentElement.style.top = (clientY - offsetY) / 16 + "rem";
  }
}

function drop(e) {
  if (!moveElement || !currentElement) return;
  e.preventDefault();
  moveElement = false;

  let dropBounds = dropContainer.getBoundingClientRect();
  let elementBounds = currentElement.getBoundingClientRect();

  if (
    elementBounds.right >= dropBounds.left &&
    elementBounds.left <= dropBounds.right &&
    elementBounds.bottom >= dropBounds.top &&
    elementBounds.top <= dropBounds.bottom &&
    canDragElement(currentElement)
  ) {
    handleSuccessfulDrop(currentElement);
  } else {
    handleFailedDrop(currentElement);
  }

  currentElement = null;
  highlightNextElement();
}

function handleSuccessfulDrop(element) {
  if (droppedElements.length >= 3) {
    return;
  }

  droppedElements.push(element);

  element.style.position = "relative";
  element.style.top = "auto";
  element.style.left = "auto";
  element.style.right = "auto";
  element.style.bottom = "auto";

  dropContainer.appendChild(element);

  let elementIndex = droppedElements.indexOf(element);
  if (elementIndex === 1) {
    element.style.zIndex = "2";
    element.style.transform = "scale(1.5) rotateZ(-26deg)";
    element.style.bottom = "0.6875rem";
    element.style.left = "0.875rem";
  } else if (elementIndex === 2) {
    element.style.zIndex = "1";
    element.style.transform = "scale(1.43) rotateZ(7deg)";
    element.style.bottom = "1.3125rem";
    element.style.left = "1rem";
  } else {
    element.style.zIndex = "1";
    element.style.transform = "scale(1.5) rotateZ(-2deg)";
    element.style.bottom = "1.25rem";
    element.style.left = "0.625rem";
  }

  removeEventListeners(element);

  if (droppedElements.length === 3) {
    let hiddenElement = document.querySelector(".hide");
    if (hiddenElement) {
      hiddenElement.style.opacity = "0";
      hiddenElement.classList.remove("hide");
      setTimeout(() => {
        hiddenElement.style.opacity = "1";
      }, 0);
    }
  }
}

function handleFailedDrop(element) {
  let initialStyles = element.initialStyles;
  if (initialStyles) {
    element.style.position = initialStyles.position;
    element.style.left = initialStyles.left;
    element.style.right = initialStyles.right;
    element.style.top = initialStyles.top;
    element.style.bottom = initialStyles.bottom;
    element.style.transform = "scale(1)";

    if (initialStyles.parentElement !== element.parentElement) {
      initialStyles.parentElement.appendChild(element);
    }
  }
}

function removeEventListeners(element) {
  element.removeEventListener("mousedown", dragStart);
  element.removeEventListener("touchstart", dragStart);
}

window.onload = () => {
  dropContainer.style.position = "relative";
  dragObjects.forEach(dragObject => {
    dragObject.setAttribute("draggable", "false");
    dragObject.addEventListener("mousedown", dragStart);
    dragObject.addEventListener("touchstart", dragStart);
  });
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", drop);
  document.addEventListener("touchmove", move, { passive: false });
  document.addEventListener("touchend", drop);

  highlightNextElement();
};
