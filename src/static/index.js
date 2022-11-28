console.log("Hello from frontend");

const dropHandler = (event) => {
  console.log("File dropped", event);

  event.preventDefault();
};

const dragOverHandler = (event) => {
  console.log("File dragged over", event);

  event.preventDefault();
};
