export function Initials({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  const getInitials = () => {
    const init =
      title
        ?.split(" ")
        .filter((_, index) => index < 2)
        .map((s) => (s.trim().length > 0 ? s.trim().charAt(0) : "")) ?? [];
    return init.join("").toUpperCase();
  };

  return (
    <div
      title={title}
      className={[
        "w-[32px] h-[32px] rounded-3xl bg-[#ccc] text-black font-semibold mr-2 text-[10px] flex items-center justify-center cursor-pointer",
        className,
      ]
        .join(" ")
        .trim()}
    >
      {getInitials()}
    </div>
  );
}
