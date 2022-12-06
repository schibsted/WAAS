const uploadHandler = ({ file, setError }) => {
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
          setError("Something went wrong");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };
  reader.readAsArrayBuffer(file);
};

export default uploadHandler;
