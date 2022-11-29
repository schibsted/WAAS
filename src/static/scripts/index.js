console.log("Hello from frontend");

let backgroundImage = "";

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

  const usedBackgroundImages =
    JSON.parse(localStorage.getItem("usedBackgroundImages")) || [];

  if (usedBackgroundImages.length) {
    if (usedBackgroundImages.length >= imageNames.length) {
      localStorage.removeItem("usedBackgroundImages");

      const randomImageIndex = Math.round(
        Math.random() * (imageNames.length - 1)
      );
      backgroundImage = imageNames[randomImageIndex];

      localStorage.setItem(
        "usedBackgroundImages",
        JSON.stringify([backgroundImage])
      );
    } else {
      const filteredImageNames = imageNames.filter(
        (imageName) => !usedBackgroundImages.includes(imageName)
      );
      const randomImageIndex = Math.round(
        Math.random() * (filteredImageNames.length - 1)
      );
      backgroundImage = filteredImageNames[randomImageIndex];

      localStorage.setItem(
        "usedBackgroundImages",
        JSON.stringify([...usedBackgroundImages, backgroundImage])
      );
    }
  }

  if (!usedBackgroundImages.length) {
    const randomImageIndex = Math.round(
      Math.random() * (imageNames.length - 1)
    );
    backgroundImage = imageNames[randomImageIndex];

    localStorage.setItem(
      "usedBackgroundImages",
      JSON.stringify([backgroundImage])
    );
  }

  document.body.style.backgroundImage = `url(${imageRootPath}${backgroundImage})`;
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
