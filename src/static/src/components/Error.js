const Error = ({ errorMessage, onBack }) => {
  return html`
    <main class="error">
      <h1>OoOops 💩</h1>
      <p>${errorMessage}</p>
      <button onclick=${() => onBack()}>Go back</button>
    </main>
  `;
};
export default Error;
