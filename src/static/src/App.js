import DragAndDrop from "./components/DragAndDrop.js";
import Header from "./components/Header.js";
import UploadForm from "./components/UploadForm.js";
import { images } from "./utils/constants.js";
import uploadHandler from "./utils/UploadHandler.js";

const App = () => {
  const { useState, useEffect } = preact;
  const [image, setImage] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const index = Number(localStorage.getItem("backgroundIndex") || 0);

    const nextIndex = (index + 1) % images.length;

    localStorage.setItem("backgroundIndex", nextIndex);
    setImage(images[nextIndex]);
  }, [images]);

  const handleDragEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();

    switch (event.type) {
      case "dragleave":
      case "dragend":
        if (event.relatedTarget) {
          return;
        }
        setIsDragging(false);
        break;

      case "dragenter":
      case "dragstart":
        setIsDragging(true);
        break;

      case "drop":
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        uploadHandler(file);
        break;

      default:
        break;
    }
  };

  return html`
    <div
      style=${{
        backgroundColor: image.accentcolor,
        backgroundImage: image.name
          ? isDragging
            ? "none"
            : `url(static/images/${image.name})`
          : "none",
      }}
      class="app"
      ondragstart=${(event) => handleDragEvent(event)}
      ondrag=${(event) => handleDragEvent(event)}
      ondragend=${(event) => handleDragEvent(event)}
      ondragenter=${(event) => handleDragEvent(event)}
      ondragover=${(event) => handleDragEvent(event)}
      ondragleave=${(event) => handleDragEvent(event)}
      ondrop=${(event) => handleDragEvent(event)}
    >
      ${!isDragging
        ? html`
            <${Header}
              imageAuthor=${image.author}
              imageOrigin=${image.origin}
            />
            <main class="main">
              <${UploadForm}
                uploadHandler=${uploadHandler}
                accentColor=${image.accentcolor}
              />
            </main>
          `
        : html`<${DragAndDrop} />`}
    </div>
  `;
};

export default App;
