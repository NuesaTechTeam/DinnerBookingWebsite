import React from "react";
import { useNavigate } from "react-router-dom";

const Link = ({ href, children, ...props }) => {
  const navigate = useNavigate();

  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  const handleClick = (e) => {
    if (isExternal) return;

    e.preventDefault();
    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={!isExternal ? handleClick : undefined}
      {...(isExternal
        ? {
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {})}
      {...props}
    >
      {children}
    </a>
  );
};

export default Link;
