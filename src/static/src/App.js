import DragAndDrop from "./components/DragAndDrop.js";
import Error from "./components/Error.js";
import Header from "./components/Header.js";
import UploadForm from "./components/UploadForm.js";
import { allowedFileTypes, images } from "./utils/constants.js";
import uploadHandler from "./utils/UploadHandler.js";

const App = () => {
  const { useState, useEffect } = preact;
  const [image, setImage] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        setIsDragging(true);
        setErrorMessage("");
        break;

      case "drop":
        setIsDragging(false);
        const files = event.dataTransfer.files;
        if (files.length > 1) {
          setErrorMessage("Please upload only one file");
          return;
        }
        const file = files[0];
        if (!allowedFileTypes.some((type) => file.type.includes(type))) {
          setErrorMessage("Please upload a valid file");
          return;
        }

        uploadHandler({ file, setError: setErrorMessage });
        break;

      default:
        break;
    }
  };

  const shouldShowBackground = image.name && !isDragging && !errorMessage;

  return html`
    <div
      style=${{
        backgroundColor: image.accentcolor,
        backgroundImage: shouldShowBackground
          ? `url(static/images/${image.name})`
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
      ${isDragging
        ? html`<${DragAndDrop} />`
        : errorMessage
        ? html`<${Error}
            errorMessage=${errorMessage}
            setError=${setErrorMessage}
          />`
        : html`
            <${Header}
              imageAuthor=${image.author}
              imageOrigin=${image.origin}
            />
            <main class="main">
              <${UploadForm}
                onChange=${(file) =>
                  uploadHandler({ file, setError: setErrorMessage })}
                accentColor=${image.accentcolor}
              />
            </main>
          `}
    </div>
  `;
};

export default App;
