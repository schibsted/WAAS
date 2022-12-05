import * as preact from "https://cdn.skypack.dev/preact";
import * as hooks from "https://cdn.skypack.dev/preact/hooks";

import { html } from "https://cdn.skypack.dev/htm/preact";

window.html = html;
window.preact = { ...preact, ...hooks };

import App from "./App.js";
console.debug("Hello from frontend");

preact.render(html`<${App} />`, document.body);
