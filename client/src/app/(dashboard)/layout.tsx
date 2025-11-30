import NavBar from "../../components/NavBar";
import React from "react";

function layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-screen text-white flex">
      <NavBar />
      <div className="flex-1 overflow-auto ml-24">
        {children}
      </div>
    </div>
  );
}

export default layout;