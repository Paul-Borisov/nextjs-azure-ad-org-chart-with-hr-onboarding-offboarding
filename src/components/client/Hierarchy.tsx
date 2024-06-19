const Hierarchy = ({
  dataSource,
  isCollapsed,
}: {
  dataSource: () => JSX.Element | null | undefined;
  isCollapsed: boolean;
}) => {
  //await new Promise((resolve) => setTimeout(resolve, 1));
  const children = dataSource();
  return children ? (
    <div className={`${isCollapsed ? "hidden" : "block"}`}>{children}</div>
  ) : null;
};

export default Hierarchy;
