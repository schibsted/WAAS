import {
  getImageCreditElement,
  getDropGraphic,
  getFileUploadButton,
  getInputContainer,
  imageNames,
} from "./constants.js";

console.debug("Hello from frontend");

const imageRootPath = "static/images/";

let backgroundImage = "";

const setBackgroundImage = (image) => {
  document.body.style.backgroundImage = `url(${imageRootPath}${image.name})`;

  getImageCreditElement().innerHTML = `
      ${image.author} on ${image.origin}
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

const createDropGraphic = () => {
  const dropGraphicElement = document.createElement("div");
  dropGraphicElement.id = "drop-graphic";
  dropGraphicElement.classList.add("drop-graphic");
  dropGraphicElement.innerHTML = `
    <div class="create-graphic-text">
      <span>Drop it like it's hot</span>
    </div>
  `;

  return dropGraphicElement;
};

const endFileHover = () => {
  setBackgroundImage(backgroundImage);

  const dropGraphic = getDropGraphic();
  dropGraphic.remove();

  getInputContainer().style.display = "flex";
  getImageCreditElement().style.display = "block";
};

const dragOverHandler = (event) => {
  event.preventDefault();
};

const dragHandler = (event) => {
  console.log("Drag started", event);

  if (!getDropGraphic()) {
    document.body.style.backgroundImage = "none";
    getImageCreditElement().style.display = "none";
    getInputContainer().style.display = "none";
    document.getElementById("main").appendChild(createDropGraphic());
  }
};

window.draghandler = dragHandler;

const dragEndHandler = (event) => {
  console.log("Drag ended", event);

  endFileHover();
};

const dropHandler = (event) => {
  event.preventDefault();
  console.log("File dropped", event);

  endFileHover();
};

const formChangeHandler = (event) => {
  // console.log("Form changed", event);

  event.preventDefault();
};
