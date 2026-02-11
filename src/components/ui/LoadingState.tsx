"use client";

import Loader from "./Loader";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ 
  message = "Loading...", 
  fullScreen = true 
}: LoadingStateProps) => {
  const containerClasses = fullScreen 
    ? "min-h-screen bg-gray-50 flex items-center justify-center" 
    : "py-12 flex items-center justify-center w-full";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className="mb-12">
          <Loader />
        </div>
        <p className="text-xl font-medium text-green-dark">{message}</p>
      </div>
    </div>
  );
};
