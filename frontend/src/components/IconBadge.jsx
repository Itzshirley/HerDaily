function IconBadge({ icon: Icon, bg, color, size = "md" }) {
  const sizeClasses = size === "lg" ? "w-14 h-14 text-2xl" : "w-12 h-12 text-xl";

  return (
    <div
      className={`${sizeClasses} rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color}`}
    >
      <Icon />
    </div>
  );
}

export default IconBadge;
