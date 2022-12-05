const uploadHandler = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    fetch("/v1/transcribe?model=tiny", {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: event.target.result,
    });
  };
  reader.readAsArrayBuffer(file);
};

export default uploadHandler;
