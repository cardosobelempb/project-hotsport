import React from "react";

export default function Card({ className = "", hover = false, children, ...props }) {
  return (
    <div
      className={`bg-[#1a1d27] border border-gray-800 rounded-xl ${hover ? "hover:border-gray-700 transition-all duration-200" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`p-4 border-b border-gray-800 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className = "", children, ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
