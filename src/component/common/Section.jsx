import React from "react";

export default function Section({ title, children, style = {}, className = "" }) {
  return (
    <div className={`bg-dark rounded-4 p-4 shadow-sm ${className}`} style={style}>
      <h5 className="mb-3">{title}</h5>
      {children ? (
        children
      ) : (
        <p className="text-muted m-0">Contenu {title?.toLowerCase?.() || title}.</p>
      )}
    </div>
  );
}
