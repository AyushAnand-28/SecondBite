import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="p-8 font-sans text-2xl font-bold text-brand-600">
              🌿 SecondBite — coming soon
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
