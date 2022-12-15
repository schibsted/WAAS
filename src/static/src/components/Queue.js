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
    if (uploadStatus === "transcribing") {
      getJobStatus(jobId).then((data) => {
        setJobStatus(data);
      });

      const interval = setInterval(() => {
        getJobStatus(jobId).then((data) => {
          setJobStatus(data);

          // Stop polling when the job isn't queued for processing
          if (
            !["queued", "scheduled", "deferred", "started"].includes(
              data.status
            )
          ) {
            clearInterval(interval);
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
            setUploadStatus("finished");
          }
        });
      }, 10_000);

      return () => clearInterval(interval);
    }
  }, [uploadStatus]);

  return html`<p>${JSON.stringify(jobStatus, undefined, 2)}</p>`;
};

export default Queue;
