const JojoLogo = () => {
  return html`
    <svg xmlns="http://www.w3.org/2000/svg" width="153" height="51" fill="none">
      <g filter="url(#a)">
        <path
          fill="#fff"
          d="M16.9 34.1v-19H0V51h35.8V.6H19v33.5h-2.1Zm22 16.9h35.8V.6H38.8V51Zm16.8-16.9v-21h2v21h-2Zm38.8 0v-19H77.6V51h35.9V.6H96.6v33.5h-2Zm22 16.9h35.8V.6h-35.8V51Zm16.8-16.9v-21h2.1v21h-2Z"
        />
      </g>
      <defs>
        <filter
          id="a"
          width="160.3"
          height="58.4"
          x="-4"
          y="-3.4"
          color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_2_121"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_2_121"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  `;
};

export default JojoLogo;
