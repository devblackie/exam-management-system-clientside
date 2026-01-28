"use client";

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
    : "py-20 flex items-center justify-center w-full";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-dark border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-xl font-medium text-green-dark">{message}</p>
      </div>
    </div>
  );
};