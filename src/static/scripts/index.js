import {
  imageNames,
  getImageCreditElement,
  getFileUploadButton,
  getInputContainer,
  getDragDropOverlay,
} from "./constants.js";

console.debug("Hello from frontend");

const imageRootPath = "static/images/";

let backgroundImage = "";

const setBackgroundImage = (image) => {
  document.body.style.backgroundImage = `url(${imageRootPath}${image.name})`;

  getImageCreditElement().innerHTML = `
      Photo by ${image.author} on ${image.origin}
  `;
};

const backgroundHandler = () => {
  const index = Number(localStorage.getItem("backgroundIndex") || 0);

  const nextIndex = (index + 1) % imageNames.length;

  localStorage.setItem("backgroundIndex", nextIndex);

  backgroundImage = imageNames[nextIndex];
  setBackgroundImage(backgroundImage);
};

const init = () => {
  backgroundHandler();

  document.body.style.backgroundColor = backgroundImage.accentcolor;
  getFileUploadButton().style.backgroundColor = backgroundImage.accentcolor;

  window.addEventListener("dragover", (event) => dragOverHandler(event));
  window.addEventListener("dragenter", (event) => dragHandler(event));

  window.addEventListener("dragleave", (event) => dragEndHandler(event));
  window.addEventListener("dragend", (event) => dragEndHandler(event));

  window.addEventListener("drop", (event) => dropHandler(event));
};

init();

const endFileHover = () => {
  setBackgroundImage(backgroundImage);

  const dragDropOverlay = getDragDropOverlay();
  dragDropOverlay.hidden = true;

  getInputContainer().style.display = "flex";
  getImageCreditElement().style.display = "block";
};

const dragOverHandler = (event) => {
  event.preventDefault();
};

const dragHandler = () => {
  document.body.style.backgroundImage = "none";
  getImageCreditElement().style.display = "none";
  getInputContainer().style.display = "none";

  const dragDropOverlay = getDragDropOverlay();
  dragDropOverlay.hidden = false;
};

const dragEndHandler = (event) => {
  if (event.relatedTarget) {
    return;
  }

  endFileHover();
};

const dropHandler = (event) => {
  event.preventDefault();
  console.log("File dropped", event);

  endFileHover();
};

const formChangeHandler = (event) => {
  event.preventDefault();
};
