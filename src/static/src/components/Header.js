import { JojoLogo } from "./icons/index.js";

const Header = ({ imageAuthor, imageOrigin }) => {
  return html`
    <header class="header">
      <${JojoLogo} />
      <p class="image-credit">Image: ${imageAuthor}/${imageOrigin}</p>
    </header>
  `;
};

export default Header;
