type UserAvatarProps = {
  avatarUrl?: string | null;
  name?: string;
  email?: string;
  className?: string;
  textClassName?: string;
  alt?: string;
};

function getInitials(name?: string, email?: string) {
  const safeName = (name || "").trim();
  if (safeName) {
    const parts = safeName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (email) {
    return email.slice(0, 1).toUpperCase();
  }

  return "U";
}

function getColorFromSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 48%)`;
}

export default function UserAvatar({
  avatarUrl,
  name,
  email,
  className = "",
  textClassName = "",
  alt = "User avatar",
}: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={alt}
        className={`h-full w-full object-cover ${className}`.trim()}
      />
    );
  }

  const initials = getInitials(name, email);
  const colorSeed = `${name || ""}-${email || ""}`;
  const backgroundColor = getColorFromSeed(colorSeed || "default-user");

  return (
    <div
      className={`flex h-full w-full items-center justify-center text-white ${className}`.trim()}
      style={{ backgroundColor }}
      aria-label={alt}
      title={name || email || "User"}
    >
      <span className={`font-semibold ${textClassName}`.trim()}>{initials}</span>
    </div>
  );
}

