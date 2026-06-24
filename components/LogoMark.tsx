type LogoMarkProps = {
  className?: string;
  title?: string;
  idPrefix?: string;
  size?: number;
};

export function LogoMark({ className, title = "Knowledge Exchange", size = 36 }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      role="img"
      aria-label={title}
      className={className}
      width={size}
      height={size}
      style={{ width: size, height: size, maxWidth: "100%", flexShrink: 0 }}
    >
      <g>
        <path
          fill="#7C3AED"
          fillRule="evenodd"
          d="M256 64 400 146 256 228 112 146 256 64Zm0 54 50 28-50 29-50-29 50-28Z"
        />
        <path
          fill="#5B21B6"
          fillRule="evenodd"
          d="M112 146 256 228v220L112 366V146Zm54 96v92l46 27v-92l-46-27Z"
        />
        <path
          fill="#06B6D4"
          fillRule="evenodd"
          d="M400 146v220l-144 82V228l144-82Zm-54 96-46 27v92l46-27v-92Z"
        />
        <path fill="#0B1020" d="m206 146 50-28 50 28-50 29-50-29Z" />
        <path fill="#0B1020" d="m166 242 46 27v92l-46-27v-92Z" opacity="0.82" />
        <path fill="#0B1020" d="m346 242-46 27v92l46-27v-92Z" opacity="0.72" />
        <path fill="#2563EB" d="m112 146 144 82v34l-144-82v-34Z" opacity="0.85" />
        <path fill="#38BDF8" d="m400 146-144 82v34l144-82v-34Z" opacity="0.78" />
      </g>
    </svg>
  );
}
