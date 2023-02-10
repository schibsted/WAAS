import SettingsEmail from "./SettingEmail.js";
import SettingsLanguage from "./SettingLanguage.js";

const randomWord = () => {
  const words =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
      .replace(/[\.,\']/g, "")
      .split(" ");
  return words[Math.floor(Math.random() * words.length - 1)];
};

const randomSentence = (numberOfWords = 3) => {
  let words = [];
  for (let i = 0; i < numberOfWords; i++) {
    words.push(randomWord());
  }
  return words.join(" ");
};

const Editor = ({
  fileStored,
  setUploadStatus,
  setErrorMessage,
  setJobId,
  onCancel,
}) => {
  const { useState, useEffect } = preact;

  const [cursor, setCursor] = useState(0);
  const [playState, setPlayState] = useState(false);
  const [text, setText] = useState([]);

  useEffect(() => {
    const audioElement = document.getElementById("audio-editor");
    audioElement.currentTime = cursor;
  }, [playState, cursor]);

  const toggleSelection = (el) => {
    Array.from(document.querySelectorAll(".selected")).map((element) => {
      element.classList.remove("selected");
    });
    el.classList.toggle("selected");
  };

  useEffect(() => {
    const transcriptionTable = document.getElementById("transcription");
    transcriptionTable.addEventListener("click", (event) => {
      const el = event.target;
      if (el.nodeName !== "TD") return;
      toggleSelection(el);
      setCursor(parseFloat(el.dataset.cursor));
    });

    let interval = 1;
    setInterval(() => {
      setText((old) =>
        [].concat(old, { text: randomSentence(5), cursor: 2.5 * interval++ })
      );
    }, 2500);
  }, []);

  useEffect(() => {
    const reader = new FileReader();
    const audioElement = document.getElementById("audio-editor");
    reader.addEventListener("load", function (event) {
      audioElement.src = event.target.result;
      audioElement.controls = true;
    });

    reader.readAsDataURL(fileStored);
  }, [fileStored]);

  const textTable = text.map(
    (t) =>
      html`<tr>
        <td contenteditable="true" spellcheck="true" data-cursor="${t.cursor}">
          ${t.text}
        </td>
      </tr>`
  );

  return html` <main class="editor">
    <button class="button-cancel" aria-label="cancel">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          stroke="#fff"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="m17.25 6.75-10.5 10.5M6.75 6.75l10.5 10.5"
        ></path>
      </svg>
    </button>
    <h1>Editor</h1>
    <audio id="audio-editor"></audio>
    <p class="language-description">
      Chose main language that is spoken in the file, to help us get the best
      transcription
    </p>
    <table id="transcription" cellpadding="10" cellspacing="5">
      ${textTable}
    </table>
    <button onclick="javascript:setUploadStatus('pending')">Videre</button>
  </main>`;
};

export default Editor;
