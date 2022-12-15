import getJobStatus from "../utils/getJobStatus.js";

const Queue = ({
  jobStatus,
  setJobStatus,
  jobId,
  uploadStatus,
  setUploadStatus,
  setErrorMessage,
}) => {
  const { useEffect } = preact;

  useEffect(() => {
    if (uploadStatus === "queued" || uploadStatus === "transcribing") {
      getJobStatus(jobId).then((data) => {
        setJobStatus(data);
      });

      const interval = setInterval(() => {
        getJobStatus(jobId).then((data) => {
          setJobStatus(data);

          if (data.status === "started") {
            setUploadStatus("transcribing");
          }

          // Set an error message if the job failed
          if (["failed", "stopped", "canceled"].includes(data.status)) {
            clearInterval(interval);
            setErrorMessage(
              `Something went wrong, please send the following ID to the team: ${jobId}`
            );
          }

          // Set the upload status to finished if the job succeeded
          if (data.status === "finished") {
            clearInterval(interval);
            setUploadStatus("transcribed");
          }
        });
      }, 10_000);

      return () => clearInterval(interval);
    }
  }, [uploadStatus]);

  const getTitle = () => {
    if (uploadStatus === "uploading") return "Uploading your file";
    if (uploadStatus === "queued") return "Your file is queued for processing";
    if (uploadStatus === "transcribing") return "Transcribing your file";
    if (uploadStatus === "transcribed") return "Your file is ready";
  };

  const getDescription = () => {
    if (uploadStatus === "uploading")
      return "Your file is being uploaded to our servers. This may take a few minutes. Please don't close this page.";
    if (uploadStatus === "queued")
      return "Your file is now in the queue! When the file is finished transcribing you will receive an email with a download link. You can now safely close this page without interfering with the transcription. See you!";
    if (uploadStatus === "transcribing")
      return "Your file is being transcribed. When the file is finished transcribing you will receive an email with a download link. You can now safely close this page without interfering with the transcription. See you!";
    if (uploadStatus === "transcribed")
      return "Your file is ready. You can download it below.";
  };

  return html`<div class="upload-form">
    <h1>${getTitle()}</h1>
    <p>${getDescription()}</p>
    <details class="advanced-settings">
      <summary>Advanced view</summary>
      <div class="advanced-settings-content">
        <pre style=${{ whiteSpace: "pre-wrap" }}>
          ${JSON.stringify(jobStatus, undefined, 2)}
        </pre
        >
      </div>
    </details>
    ${uploadStatus === "transcribed"
      ? html`<a
            href=${`/v1/download/${jobId}?output=srt`}
            class="button"
            download=${`${jobId}.srt`}
          >
            Download as SRT
          </a>
          <a
            href=${`/v1/download/${jobId}?output=vtt`}
            class="button"
            download=${`${jobId}.vtt`}
          >
            Download as VTT
          </a>
          <a
            href=${`/v1/download/${jobId}?output=txt`}
            class="button"
            download=${`${jobId}.txt`}
          >
            Download as TXT
          </a>`
      : ""}
  </div>`;
};

export default Queue;
