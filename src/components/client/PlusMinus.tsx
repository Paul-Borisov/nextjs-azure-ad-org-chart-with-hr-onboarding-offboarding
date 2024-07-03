const PlusMinus = ({
  isCollapsed,
  className,
}: {
  isCollapsed: boolean;
  className?: string;
}) => {
  return (
    <div
      className={[
        className ? className : "",
        "absolute -ml-8 text-3xl cursor-pointer",
      ]
        .join(" ")
        .trim()}
    >
      {isCollapsed ? "+" : ""}
    </div>
  );
};

export default PlusMinus;
