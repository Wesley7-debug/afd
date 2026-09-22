"use client";

const COLORS = [
  { bg: "bg-yc-green-soft", text: "text-yc-green" },
  { bg: "bg-yc-pink-soft", text: "text-yc-pink" },
  { bg: "bg-yc-gold-soft", text: "text-yc-gold" },
  { bg: "bg-yc-indigo-soft", text: "text-yc-indigo" },
  { bg: "bg-yc-purple-soft", text: "text-yc-purple" },
  { bg: "bg-yc-orange-soft", text: "text-yc-orange" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COLORS.length;
}

interface FounderAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-16 w-16 text-lg",
};

export default function FounderAvatar({ name, imageUrl, size = "md" }: FounderAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  const color = COLORS[getColorIndex(name)];
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} ${color.bg} ${color.text} flex items-center justify-center rounded-full font-medium`}
    >
      {initials}
    </div>
  );
}
