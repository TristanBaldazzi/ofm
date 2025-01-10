"use client";

import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="relative flex items-center justify-center">
        {/* Outer Galaxy Ring */}
        <div className="w-40 h-40 border-8 border-dashed border-gray-300 rounded-full animate-spin-galaxy"></div>
        
        {/* Shooting Star */}
        <div className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-shooting-star"></div>
        
        {/* Central Pulsating Nebula */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse-nebula shadow-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
