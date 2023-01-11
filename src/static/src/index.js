import * as preact from "preact";
import * as hooks from "preact/hooks";
import { html } from "preact/htm";
import App from "./App.js";

window.html = html;
window.preact = { ...preact, ...hooks };

console.debug("Hello from frontend");
preact.render(html`<${App} />`, document.body);
