import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-11 h-11 border-[3.5px]",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-sage-200 border-t-sage-600 rounded-full animate-spin`}
      />
      {label && <p className="text-xs font-medium text-stone-500 tracking-wide">{label}</p>}
    </div>
  );
};
