import toTimeString from "../utils/toTimeString.js";
import { PlayIcon } from "./icons/index.js";

const Table = ({ jojoDoc, hasAudio = false, setCursor }) => {
  const { useState, useEffect } = preact;
  const [editElement, setEditElement] = useState();
  const text = jojoDoc.segments;

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

    return () => {
      transcriptionTable.removeEventListener("click", clickListener);
      transcriptionTable.removeEventListener("focus", focusListener);
    };
  }, []);

  const rows = text.map(
    (t) =>
      html`<tr
        key="${t.id}"
        data-cursor="${t.timeStart / 100}"
        data-id="${t.id}"
      >
        ${hasAudio &&
        html`<td class="play-button-cell">
          <${PlayIcon} />
        </td>`}
        <td>${toTimeString(t.timeStart / 100)}</td>
        <td contenteditable="true" spellcheck="true">${t.text}</td>
      </tr>`
  );

  return html`
    <table id="transcription" cellpadding="10" cellspacing="5">
      <tr>
        ${hasAudio &&
        html`<th>
          <b>Play</b>
        </th>`}
        <th><b>Time</b></th>
        <th align="left"><b>Transcription</b></th>
      </tr>
      ${rows}
    </table>
  `;
};
export default Table;
