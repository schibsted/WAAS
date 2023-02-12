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

const toTimeString = (totalSeconds) => {
  const totalMs = totalSeconds * 1000;
  const result = new Date(totalMs).toISOString().slice(11, 19);

  return result;
};

const Table = ({ setCursor }) => {
  const { useState, useEffect } = preact;
  const [editElement, setEditElement] = useState(null);
  const [text, setText] = useState([]);

  useEffect(() => {
    let el = editElement;
    if (!el) return () => {};

    const id = el.dataset.id;
    const listener = () => {
      const inputedText = el.querySelector("[contenteditable]").innerText;
      const textRef = text.find((t) => t.id == id);
      if (textRef.text !== inputedText) {
        textRef.text = inputedText;
      }
    };

    el.classList.toggle("selected");
    el.addEventListener("focusout", listener, false);

    return () => {
      el.classList.remove("selected");
      el.removeEventListener("focusout", listener);
    };
  }, [editElement]);

  useEffect(() => {
    const transcriptionTable = document.getElementById("transcription");
    const clickListener = (event) => {
      const el = event.target;
      const tr = el.closest("tr");
      const playBtn = el.closest("svg");
      if (playBtn && playBtn.nodeName === "svg") {
        setCursor(parseFloat(tr.dataset.cursor) || 0);
      }
    };

    const focusListener = (event) => {
      const tr = event.target.closest("tr");
      if (tr.nodeName !== "TR") return;
      setEditElement(tr);
    };

    transcriptionTable.addEventListener("click", clickListener);
    transcriptionTable.addEventListener("focus", focusListener, true);

    let interval = 1;
    setInterval(() => {
      setText((old) =>
        [].concat(old, [
          {
            text: randomSentence(5),
            timeStart: 2.5 * interval++,
            timeEnd: 2.5 * interval + 2.5,
            id:
              Math.random().toString(16).substr(2) +
              "-546B-47BB-8900-" +
              Math.random().toString(16).substr(2),
          },
        ])
      );
    }, 200);

    return () => {
      transcriptionTable.removeEventListener("click", clickListener);
      transcriptionTable.removeEventListener("focus", focusListener);
    };
  }, []);

  const rows = text.map(
    (t) =>
      html`<tr key="${t.id}" data-cursor="${t.timeStart}" data-id="${t.id}">
        <td>
          <svg
            class="play-icon"
            fill="#000000"
            height="100%"
            width="100%"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 64 64"
            enable-background="new 0 0 64 64"
            xml:space="preserve"
          >
            <g>
              <circle
                class="play"
                fill="#fff"
                cx="50%"
                cy="50%"
                r="48%"
                stroke="black"
                stroke-width="2"
              ></circle>
              <path
                class="play"
                stroke-width="2"
                d="M46.0136986,31.1054993L25.1973,20.6973c-0.3096008-0.1532993-0.6777992-0.1387005-0.9727001,0.0438995
                C23.9297009,20.9237995,23.75,21.2451,23.75,21.5918007v20.8163986c0,0.3467026,0.1797009,0.6679993,0.4745998,0.8506012
                C24.3848,43.3583984,24.5674,43.4081993,24.75,43.4081993c0.1532993,0,0.3057003-0.035099,0.4473-0.1054001l20.8163986-10.4081993
                c0.3388023-0.1699982,0.5527-0.5157013,0.5527-0.8945999C46.5663986,31.6210995,46.3525009,31.2754002,46.0136986,31.1054993z
                 M25.75,40.7901001v-17.580101L43.330101,32L25.75,40.7901001z"
              ></path>
            </g>
          </svg>
        </td>
        <td>${toTimeString(t.timeStart)}</td>
        <td contenteditable="true" spellcheck="true">${t.text}</td>
      </tr>`
  );

  // console.log("render Table");
  return html`
    <table id="transcription" cellpadding="10" cellspacing="5">
      <th>
        <b>Play</b>
      </th>
      <th><b>Time</b></th>
      <th align="left"><b>Transcription</b></th>
      ${rows}
    </table>
  `;
};
export default Table;
