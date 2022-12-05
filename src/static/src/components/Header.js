import { JojoLogo } from "./icons/index.js";

const Header = ({ imageAuthor, imageOrigin }) => {
  return html`
    <header class="header">
      <${JojoLogo} />
      <!-- image credit -->
      <p class="image-credit">Photo by ${imageAuthor} on ${imageOrigin}</p>
    </header>
  `;
};

export default Header;
