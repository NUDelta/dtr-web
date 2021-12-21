import React from "react";

interface ContainerProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export default function Container({
  children,
  className,
  ...rest
}: ContainerProps) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
