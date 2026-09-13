import type { CSSProperties } from "react";

export type Species = "cat" | "rabbit" | "bear" | "dog" | "fox" | "panda";

export const SPECIES: readonly Species[] = [
  "cat",
  "rabbit",
  "bear",
  "dog",
  "fox",
  "panda",
];

export const ANIMAL_ASPECT = 200 / 260;

export const PART_ORIGIN: Record<string, string> = {
  tail: "150 148",
  legL: "78 206",
  legR: "122 206",
  armL: "56 150",
  armR: "144 150",
  body: "100 178",
  head: "100 92",
  earL: "62 46",
  earR: "138 46",
};

interface EarShape {
  left: string;
  right: string;
  innerLeft?: string;
  innerRight?: string;
  dark?: boolean;
}

const EARS: Record<Species, EarShape> = {
  cat: {
    left: "M58 64 L46 6 L96 42 Z",
    right: "M142 64 L154 6 L104 42 Z",
    innerLeft: "M64 58 L54 18 L88 42 Z",
    innerRight: "M136 58 L146 18 L112 42 Z",
  },
  rabbit: {
    left: "M70 66 C56 18 64 -18 80 -14 C92 -10 88 26 84 64 Z",
    right: "M130 66 C144 18 136 -18 120 -14 C108 -10 112 26 116 64 Z",
    innerLeft: "M74 60 C66 22 72 -6 80 -4 C86 -2 84 24 82 58 Z",
    innerRight: "M126 60 C134 22 128 -6 120 -4 C114 -2 116 24 118 58 Z",
  },
  bear: {
    left: "M38 50 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 Z",
    right: "M118 50 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 Z",
    innerLeft: "M48 50 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z",
    innerRight: "M128 50 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z",
  },
  dog: {
    left: "M58 54 C34 60 30 108 46 122 C60 132 66 94 68 62 Z",
    right: "M142 54 C166 60 170 108 154 122 C140 132 134 94 132 62 Z",
  },
  fox: {
    left: "M54 66 L38 -4 L98 40 Z",
    right: "M146 66 L162 -4 L102 40 Z",
    innerLeft: "M60 60 L48 8 L88 40 Z",
    innerRight: "M140 60 L152 8 L112 40 Z",
  },
  panda: {
    left: "M38 50 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 Z",
    right: "M118 50 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 Z",
    dark: true,
  },
};

const PUFF = "M148 196 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z";

const TAILS: Partial<Record<Species, string>> = {
  cat: "M156 196 C192 190 202 156 186 140 C176 130 162 140 170 152 C180 166 172 180 152 182 Z",
  dog: "M156 194 C188 190 196 162 182 148 C174 140 162 148 168 158 C176 170 166 178 152 180 Z",
  fox: "M154 198 C196 192 208 152 190 132 C178 120 162 132 172 146 C184 162 176 180 150 184 Z",
  panda: PUFF,
  bear: PUFF,
  rabbit: PUFF,
};

interface Palette {
  fur: string;
  furDark: string;
  inner: string;
  ink: string;
}

interface Props {
  species: Species;
  palette: Palette;
  asleep?: boolean;
  rigged?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Animal({
  species,
  palette,
  asleep = false,
  rigged = false,
  className,
  style,
}: Props) {
  const ears = EARS[species];
  const tail = TAILS[species];
  const part = (name: string) => (rigged ? name : undefined);

  return (
    <svg
      viewBox="-20 -30 240 300"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {tail ? (
        <g data-part={part("tail")} style={{ transformOrigin: "150px 148px" }}>
          <path
            d={tail}
            fill={palette.furDark}
            stroke={palette.ink}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      <g data-part={part("legL")} style={{ transformOrigin: "78px 206px" }}>
        <rect
          transform="rotate(-5 78 206)"
          x="60"
          y="200"
          width="36"
          height="54"
          rx="18"
          fill={palette.fur}
          stroke={palette.ink}
          strokeWidth="4"
        />
        <ellipse
          transform="rotate(-5 78 206)"
          cx="78"
          cy="244"
          rx="15"
          ry="10"
          fill={palette.inner}
        />
      </g>

      <g data-part={part("legR")} style={{ transformOrigin: "122px 206px" }}>
        <rect
          transform="rotate(5 122 206)"
          x="104"
          y="200"
          width="36"
          height="54"
          rx="18"
          fill={palette.fur}
          stroke={palette.ink}
          strokeWidth="4"
        />
        <ellipse
          transform="rotate(5 122 206)"
          cx="122"
          cy="244"
          rx="15"
          ry="10"
          fill={palette.inner}
        />
      </g>

      <g data-part={part("armL")} style={{ transformOrigin: "56px 150px" }}>
        <rect
          transform="rotate(-28 56 150)"
          x="20"
          y="142"
          width="52"
          height="32"
          rx="16"
          fill={palette.fur}
          stroke={palette.ink}
          strokeWidth="4"
        />
        <circle
          transform="rotate(-28 56 150)"
          cx="30"
          cy="158"
          r="13"
          fill={palette.inner}
          stroke={palette.ink}
          strokeWidth="3"
        />
      </g>

      <g data-part={part("armR")} style={{ transformOrigin: "144px 150px" }}>
        <rect
          transform="rotate(28 144 150)"
          x="128"
          y="142"
          width="52"
          height="32"
          rx="16"
          fill={palette.fur}
          stroke={palette.ink}
          strokeWidth="4"
        />
        <circle
          transform="rotate(28 144 150)"
          cx="170"
          cy="158"
          r="13"
          fill={palette.inner}
          stroke={palette.ink}
          strokeWidth="3"
        />
      </g>

      <g data-part={part("body")} style={{ transformOrigin: "100px 178px" }}>
        <path
          d="M100 118 C148 118 166 148 166 182 C166 216 140 236 100 236 C60 236 34 216 34 182 C34 148 52 118 100 118 Z"
          fill={palette.fur}
          stroke={palette.ink}
          strokeWidth="4"
        />
        <ellipse cx="100" cy="192" rx="30" ry="26" fill={palette.inner} />
      </g>

      <g data-part={part("head")} style={{ transformOrigin: "100px 92px" }}>
        <g data-part={part("earL")} style={{ transformOrigin: "62px 46px" }}>
          <path
            d={ears.left}
            fill={ears.dark ? palette.furDark : palette.fur}
            stroke={palette.ink}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {ears.innerLeft ? (
            <path d={ears.innerLeft} fill={palette.inner} />
          ) : null}
        </g>

        <g data-part={part("earR")} style={{ transformOrigin: "138px 46px" }}>
          <path
            d={ears.right}
            fill={ears.dark ? palette.furDark : palette.fur}
            stroke={palette.ink}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {ears.innerRight ? (
            <path d={ears.innerRight} fill={palette.inner} />
          ) : null}
        </g>

        <ellipse
          cx="100"
          cy="92"
          rx="62"
          ry="56"
          fill={palette.fur}
          stroke={palette.ink}
          strokeWidth="4"
        />

        {species === "panda" ? (
          <>
            <ellipse cx="76" cy="88" rx="17" ry="20" fill={palette.furDark} />
            <ellipse cx="124" cy="88" rx="17" ry="20" fill={palette.furDark} />
          </>
        ) : null}

        {species === "fox" ? (
          <path
            d="M100 62 C128 74 140 96 138 122 C124 134 76 134 62 122 C60 96 72 74 100 62 Z"
            fill={palette.inner}
            opacity="0.85"
          />
        ) : null}

        {asleep ? (
          <>
            <path
              d="M66 88 q10 9 20 0"
              stroke={palette.ink}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M114 88 q10 9 20 0"
              stroke={palette.ink}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="78" cy="88" r="7" fill={palette.ink} />
            <circle cx="122" cy="88" r="7" fill={palette.ink} />
            <circle cx="80.5" cy="85.5" r="2.4" fill="#ffffff" />
            <circle cx="124.5" cy="85.5" r="2.4" fill="#ffffff" />
          </>
        )}

        <ellipse cx="100" cy="106" rx="9" ry="7" fill={palette.ink} />
        <path
          d="M92 116 q8 8 16 0"
          stroke={palette.ink}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse
          cx="62"
          cy="104"
          rx="9"
          ry="6"
          fill={palette.furDark}
          opacity="0.5"
        />
        <ellipse
          cx="138"
          cy="104"
          rx="9"
          ry="6"
          fill={palette.furDark}
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
