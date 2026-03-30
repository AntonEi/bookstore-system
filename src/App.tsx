import React from "react";
import "./App.css";

import Calendar from "./pages/Absence/Calendar";
import Books from "./pages/Absence/Books";

function App() {

  const [view, setView] = React.useState("calendar");

  const handleNavigate = (v: string) => {
    setView(v);
  };

  return (
    <div className="App">

      {view === "calendar" && (
        <Calendar onNavigate={handleNavigate} />
      )}

      {view === "books" && (
        <Books onNavigate={handleNavigate} />
      )}

    </div>
  );
}

export default App;