const PlayIcon = () => {
  return html`
    <svg
      class="play-icon"
      fill="#000000"
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
          fill="#fff"
          cx="50%"
          cy="50%"
          r="48%"
          stroke="black"
          stroke-width="2"
        ></circle>
        <rect class="stop" width="35%" height="35%" stroke="black" stroke-width="2" fill="#fff" x="33%" y="33%"></rect>
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
  `;
};

export default PlayIcon;
