import logo from './logo.svg';
// import './App.css';
// import ShopView from './Components/Shop';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from './Components/Auth';
import Main from './Components/Main';

function App() {
  return (
    <div className="App">

        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main/>}></Route>
          <Route path="/auth" element={<Auth/>}></Route>
        </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
