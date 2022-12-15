const getJobStatus = (jobId) => {
  return fetch(`v1/jobs/${jobId}`)
    .then((response) => response.json())
    .then((data) => data);
};

export default getJobStatus;
