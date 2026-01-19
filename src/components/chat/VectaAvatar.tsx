"use client";

interface VectaAvatarProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
};

export default function VectaAvatar({ size = "md", animate = false }: VectaAvatarProps) {
  return (
    <div
      className={`${sizes[size]} rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 ${
        animate ? "animate-pulse-soft" : ""
      }`}
    >
      <span className="text-white font-bold">V</span>
    </div>
  );
}

