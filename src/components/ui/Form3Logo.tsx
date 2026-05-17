interface Form3LogoProps {
  className?: string;
  height?: number;
}

export function Form3Logo({ className, height = 28 }: Form3LogoProps) {
  return (
    <svg
      height={height}
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Form3"
    >
      <text
        x="0"
        y="25"
        fontFamily="'Geist', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="-0.5"
        fill="white"
      >
        FORM
      </text>
      <text
        x="88"
        y="25"
        fontFamily="'Geist', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="-0.5"
        fill="#2acfc0"
      >
        3
      </text>
    </svg>
  );
}
