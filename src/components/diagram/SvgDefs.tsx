/** SVG pattern definitions shared across diagram layers */
export default function SvgDefs() {
  return (
    <defs>
      {/* Casing hatch pattern */}
      <pattern id="casingHatch" patternUnits="userSpaceOnUse" width="10" height="10">
        <path d="M0,0 l20,20" stroke="black" strokeWidth="2" strokeLinecap="square" />
      </pattern>

      {/* Earth/formation fill */}
      <pattern id="earthFill" patternUnits="userSpaceOnUse" width="60" height="60">
        <rect width="60" height="60" fill="#795235" />
        <circle cx="8" cy="12" r="1.2" fill="#8B5A3A" opacity="0.7" />
        <circle cx="22" cy="5" r="0.8" fill="#B4875E" opacity="0.6" />
        <circle cx="35" cy="18" r="1.5" fill="#7A4C2F" opacity="0.8" />
        <circle cx="48" cy="8" r="1" fill="#A0724C" opacity="0.6" />
        <circle cx="15" cy="28" r="1.8" fill="#8B5A3A" opacity="0.7" />
        <circle cx="42" cy="35" r="1.2" fill="#6F4528" opacity="0.8" />
        <circle cx="28" cy="45" r="0.9" fill="#B4875E" opacity="0.6" />
        <circle cx="52" cy="48" r="1.4" fill="#7A4C2F" opacity="0.7" />
        <path d="M5,25 Q20,22 35,28 T55,24" stroke="#7A4C2F" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M10,40 Q25,38 40,42 T58,38" stroke="#6F4528" strokeWidth="1.2" fill="none" opacity="0.4" />
        <ellipse cx="18" cy="15" rx="4" ry="2" fill="#6F4528" opacity="0.3" />
        <ellipse cx="45" cy="25" rx="3" ry="1.5" fill="#8B5A3A" opacity="0.4" />
        <path d="M50,15 Q52,13 54,15 Q55,17 53,18 Q51,20 50,18 Q48,17 50,15Z" fill="#5A3D25" opacity="0.8" />
      </pattern>

      {/* Sand pattern A */}
      <pattern id="sandA" patternUnits="userSpaceOnUse" width="20" height="20">
        <rect width="20" height="20" fill="#f5e6b8" />
        <circle cx="3" cy="5" r="1.5" fill="#d4c088" />
        <circle cx="13" cy="8" r="1" fill="#c9b678" />
        <circle cx="8" cy="15" r="1.2" fill="#d4c088" />
        <circle cx="17" cy="3" r="0.8" fill="#bfac6e" />
        <circle cx="6" cy="11" r="0.9" fill="#c9b678" />
      </pattern>

      {/* Sand pattern B */}
      <pattern id="sandB" patternUnits="userSpaceOnUse" width="20" height="20">
        <rect width="20" height="20" fill="#e8d9a0" />
        <circle cx="5" cy="3" r="1.2" fill="#c4b480" />
        <circle cx="15" cy="10" r="1.5" fill="#b8a870" />
        <circle cx="10" cy="17" r="1" fill="#c4b480" />
        <circle cx="2" cy="13" r="0.8" fill="#b8a870" />
        <circle cx="18" cy="6" r="1.1" fill="#c4b480" />
      </pattern>

      {/* Perforation shoot pattern (arrows) */}
      <marker id="arrowRight" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="0">
        <polygon points="0,0 8,3 0,6" fill="black" />
      </marker>
      <marker id="arrowLeft" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="180">
        <polygon points="0,0 8,3 0,6" fill="black" />
      </marker>
    </defs>
  );
}
