export default function PulseLine() {
  return (
    <div className="pulse-wrap" aria-hidden="true">
      <svg
        className="pulse-line"
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
      >
        <path
          className="pulse-path pulse-line-soft"
          d="M0,60 L120,60 L150,60 L170,20 L200,100 L230,60 L260,60 L820,60 L850,30 L880,90 L910,60 L1000,60"
        />
        <path
          className="pulse-path"
          d="M0,80 L300,80 L335,80 L360,30 L395,130 L430,10 L465,80 L500,80 L1000,80"
        />
      </svg>
    </div>
  );
}
