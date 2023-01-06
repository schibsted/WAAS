const transcriptionTimeMultiplier = 4;

const Stats = () => {
  const { useState } = preact;

  const [hours, setHours] = useState("...");

  fetch("/v1/stats")
    .then((response) => response.json())
    .then((data) => {
      setHours(
        Math.round(
          (data.total_time_transcribed / 3600) * transcriptionTimeMultiplier
        )
      )
    })

  return html`
    <div class="stats">
        <span class="hours">${hours}</span> hours saved so you can<br />
        do something else
    </header>
  `;
};

export default Stats;
