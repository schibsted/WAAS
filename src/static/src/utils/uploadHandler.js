const uploadHandler = ({ file, setErrorMessage, setUploadStatus }) => {
  setUploadStatus("uploading");
  const reader = new FileReader();
  reader.onload = (event) => {
    fetch("/v1/transcribe?model=tiny", {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: event.target.result,
    })
      .then((response) => {
        if (!response.ok) {
          return setErrorMessage("Something went wrong");
        }
        setUploadStatus("transcribing");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };
  reader.readAsArrayBuffer(file);
};

export default uploadHandler;
