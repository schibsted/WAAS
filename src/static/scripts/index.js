console.log("Hello from frontend");

const imageRootPath = "static/images/";

let backgroundImage = "";

const getInputContainer = () => document.getElementById("input-container");
const getForm = () => document.getElementById("form");
const getDropGraphic = () => document.getElementById("drop-graphic");
const getImageCreditElement = () => document.getElementById("image-credit");
const getFileUploadButton = () => document.getElementById("file-upload-button");

const setBackgroundImage = (image) => {
  document.body.style.backgroundImage = `url(${imageRootPath}${image.name})`;

  getImageCreditElement().innerHTML = `
      ${image.author} on ${image.origin}
  `;
};

const backgroundHandler = () => {
  const imageNames = [
    {
      name: "dessert-cave-background.png",
      author: "Joshua Earle",
      origin: "Unsplash",
      accentcolor: "#8b5e56",
    },
    {
      name: "glitter-background.png",
      author: "Joshua Earle",
      origin: "Unsplash",
      accentcolor: "#835d6b",
    },
    {
      name: "lagoon-fist-beach-background.png",
      author: "Nathan Dumlao",
      origin: "Unsplash",
      accentcolor: "#8bbcba",
    },
    {
      name: "forrest-background.png",
      author: "Kaique Rocha",
      origin: "Unsplash",
      accentcolor: "#354c33",
    },
    {
      name: "dessert-stones-background.png",
      author: "Jacek Dylag",
      origin: "Unsplash",
      accentcolor: "#b68a7e",
    },
    {
      name: "paint-flow-background.png",
      author: "Jannis Brandt",
      origin: "Unsplash",
      accentcolor: "#453953",
    },
    {
      name: "glitter-2-background.png",
      author: "Eddie Kopp",
      origin: "Unsplash",
      accentcolor: "#775d5d",
    },
  ];

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

const dragOverHandler = (event) => {
  event.preventDefault();
};

const dragStartHandler = (event) => {
  console.log("Drag started", event);

  if (!getDropGraphic()) {
    document.body.style.backgroundImage = "none";
    getImageCreditElement().style.display = "none";
    getInputContainer().style.display = "none";
    document.getElementById("main").appendChild(createDropGraphic());
  }
};

const endFileHover = () => {
  setBackgroundImage(backgroundImage);

  const dropGraphic = getDropGraphic();
  dropGraphic.remove();

  getInputContainer().style.display = "flex";
  getImageCreditElement().style.display = "block";
};

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
