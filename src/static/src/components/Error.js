const Error = ({ errorMessage, setError }) => {
  return html`
    <main class="error">
      <h1>OoOops 💩</h1>
      <p>${errorMessage}</p>
      <button onclick=${() => setError("")}>Go back</button>
    </main>
  `;
};
export default Error;
