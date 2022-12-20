import getJobStatus from "../utils/getJobStatus.js";
import pluralize from "../utils/pluralize.js";

const Queue = ({
  jobStatus,
  setJobStatus,
  jobId,
  uploadStatus,
  setUploadStatus,
  setErrorMessage,
}) => {
  const { useEffect } = preact;

  const queue_size = jobStatus?.queue_size || 0;
  const position_in_queue = jobStatus?.position_in_queue + 1 || 1;

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
    if (uploadStatus === "queued")
      return `You are #${position_in_queue} in the queue.`;
    if (uploadStatus === "transcribing") return "Transcribing your file";
    if (uploadStatus === "transcribed") return "Your file is ready";
  };

  const getDescription = () => {
    if (uploadStatus === "uploading")
      return "Your file is being uploaded to our servers. This may take a few minutes. Please don't close this page.";
    if (uploadStatus === "queued")
      return "The transcription process may take anywhere from a few minutes to a few hours, depending on the number and size of the files in the queue. Once the transcription is complete, you will receive an email with a link to download the finished file. In the meantime, you can safely close this page without affecting the transcription process. See you!";
    if (uploadStatus === "transcribing")
      return "Your file is being transcribed. When the file is finished transcribing you will receive an email with a download link. You can now safely close this page without interfering with the transcription. See you!";
    if (uploadStatus === "transcribed")
      return "Your file is ready. You can download it below.";
  };

  return html`<div class="upload-form">
    <h1>${getTitle()}</h1>
    ${uploadStatus === "queued"
      ? html`
          <p>
            There is a total of ${queue_size} other ${" "}
            ${pluralize(queue_size, "file", "files")} in the queue.
          </p>
        `
      : ""}

    <p>${getDescription()}</p>

    ${uploadStatus === "uploading"
      ? html`
          <div class="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        `
      : ""}
    ${uploadStatus === "transcribed"
      ? html`
          <a
            href=${`/v1/download/${jobId}?output=timecode_txt`}
            class="button"
            download=${`${jobId}.txt`}
          >
            Download as text file with timecodes
          </a>
          <a
            href=${`/v1/download/${jobId}?output=txt`}
            class="button"
            download=${`${jobId}.txt`}
          >
            Download as text file without timecodes
          </a>
          <a
            href=${`/v1/download/${jobId}?output=srt`}
            class="button"
            download=${`${jobId}.srt`}
          >
            Download as SRT file
          </a>
          <a
            href=${`/v1/download/${jobId}?output=vtt`}
            class="button"
            download=${`${jobId}.vtt`}
          >
            Download as VTT file
          </a>
        `
      : ""}
  </div>`;
};

export default Queue;
