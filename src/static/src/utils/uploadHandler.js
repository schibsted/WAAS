const uploadHandler = ({
  file,
  setErrorMessage,
  setUploadStatus,
  selectedLanguage,
  selectedModel,
  email,
}) => {
  const apiUrl = new URL(`${window.location.href}v1/transcribe`);
  const urlFormattedEmail = encodeURIComponent(email);
  apiUrl.searchParams.set("model", selectedModel || "large");
  apiUrl.searchParams.set("email_callback", urlFormattedEmail || "");
  if (selectedLanguage !== "detect-language" && selectedLanguage) {
    apiUrl.searchParams.set("language", selectedLanguage);
  }

  setUploadStatus("uploading");
  const reader = new FileReader();
  reader.onload = (event) => {
    fetch(apiUrl.toString(), {
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
