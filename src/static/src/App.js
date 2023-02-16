import DragAndDrop from "./components/DragAndDrop.js";
import Error from "./components/Error.js";
import Header from "./components/Header.js";
import Stats from "./components/Stats.js";
import Settings from "./components/Settings.js";
import Editor from "./components/Editor.js";
import Queue from "./components/Queue.js";
import UploadForm from "./components/UploadForm.js";
import { allowedFileTypes, images } from "./utils/constants.js";

const App = () => {
  const { useState, useEffect } = preact;
  const [image, setImage] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [fileStored, setFileStored] = useState(null);
  const [jojoDoc, setJojoDoc] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  useEffect(() => {
    const index = Number(localStorage.getItem("backgroundIndex") || 0);
    const nextIndex = (index + 1) % images.length;

    localStorage.setItem("backgroundIndex", nextIndex);
    setImage(images[nextIndex]);
  }, [images]);

  const handleFile = (file) => {
    if (file.name.endsWith(".jojo")) {
      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        const doc = JSON.parse(event.target.result);
        setJojoDoc(doc);
        setUploadStatus("edit");
      });

      reader.readAsText(file);
      return;
    }

    if (!allowedFileTypes.some((type) => file.type.includes(type)))
      return setErrorMessage("Please upload a Jojo or audio/video file");

    setFileStored(file);
    setUploadStatus("pending");
  };

  const handleDragEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploadStatus) return;

    switch (event.type) {
      case "dragleave":
      case "dragend":
        setIsDragging(false);
        break;

      case "dragenter":
        setIsDragging(true);
        setErrorMessage("");
        break;

      case "drop":
        setIsDragging(false);
        const files = event.dataTransfer.files;

        if (files.length > 1)
          return setErrorMessage("Please upload only one file");

        const file = files[0];

        handleFile(file);

        break;

      default:
        break;
    }
  };

  const shouldShowBackground = image.name && !isDragging && !errorMessage;

  const onBack = () => {
    setErrorMessage("");
    setUploadStatus(null);
  };

  const pageToShow = () => {
    if (errorMessage) {
      return html`<${Error} errorMessage=${errorMessage} onBack=${onBack} />`;
    }

    if (isDragging) {
      return html`<${DragAndDrop} />`;
    }

    if (uploadStatus === "edit") {
      return html`<${Editor} jojoDoc=${jojoDoc} />`;
    }

    if (uploadStatus === "pending") {
      return html`<${Settings}
        fileStored=${fileStored}
        setUploadStatus=${setUploadStatus}
        setErrorMessage=${setErrorMessage}
        setJobId=${setJobId}
        onCancel=${onBack}
      />`;
    }

    if (
      uploadStatus === "uploading" ||
      uploadStatus === "queued" ||
      uploadStatus === "transcribing" ||
      uploadStatus === "transcribed"
    ) {
      return html`
        <${Header} imageAuthor=${image.author} imageOrigin=${image.origin} />
        <main class="main">
          <${Queue}
            jobId=${jobId}
            setJobId=${setJobId}
            uploadStatus=${uploadStatus}
            setUploadStatus=${setUploadStatus}
            setJobStatus=${setJobStatus}
            jobStatus=${jobStatus}
            setErrorMessage=${setErrorMessage}
          />
        </main>
      `;
    }

    return html`
      <${Header} imageAuthor=${image.author} imageOrigin=${image.origin} />
      <${Stats} />
      <main class="main">
        <${UploadForm}
          onChange=${(file) => {
            handleFile(file);
          }}
          accentColor=${image.accentColor}
        />
      </main>
    `;
  };

  return html`
    <div
      style=${{
        backgroundColor: image.accentColor,
        backgroundImage: shouldShowBackground
          ? `url(static/images/${image.name})`
          : "none",
        backgroundBlendMode: uploadStatus === "pending" ? "multiply" : "normal",
      }}
      class=${["app", isDragging ? "isDragging" : ""].join(" ")}
      ondragstart=${(event) => handleDragEvent(event)}
      ondrag=${(event) => handleDragEvent(event)}
      ondragend=${(event) => handleDragEvent(event)}
      ondragenter=${(event) => handleDragEvent(event)}
      ondragover=${(event) => handleDragEvent(event)}
      ondragleave=${(event) => handleDragEvent(event)}
      ondrop=${(event) => handleDragEvent(event)}
    >
      ${pageToShow()}
    </div>
  `;
};

export default App;
