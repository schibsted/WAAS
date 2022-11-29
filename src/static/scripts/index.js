console.log("Hello from frontend");

const backgroundHandler = () => {
  const imageNames = [
    "dessert-cave-background.png",
    "glitter-background.png",
    "lagoon-fist-beach-background.png",
    "forrest-background.png",
    "dessert-stones-background.png",
    "paint-flow-background.png",
    "glitter-2-background.png",
  ];
  const imageRootPath = "static/images/";

  const index = Number(localStorage.getItem("backgroundIndex") || 0);

  const nextIndex = (index + 1) % imageNames.length;

  localStorage.setItem("backgroundIndex", nextIndex);

  document.body.style.backgroundImage = `url(${imageRootPath}${imageNames[nextIndex]})`;
};

backgroundHandler();

const dropHandler = (event) => {
  console.log("File dropped", event);

  event.preventDefault();

  const files = event.dataTransfer.files;

  console.log(files);
};

const dragOverHandler = (event) => {
  event.preventDefault();

  // console.log(backgroundImage);
};
