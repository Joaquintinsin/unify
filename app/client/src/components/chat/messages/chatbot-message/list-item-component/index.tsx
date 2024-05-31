export const ListItemComponent = ({
  node,
  children,
  href,
  index,
  ...props
}: any) => {
  return (
    <div className="item my-2 flex gap-2 px-5">
      <strong className="mt-[0.075rem] flex h-6 items-center rounded px-1">
        -
      </strong>
      <p>{children}</p>
    </div>
  );
};
