import logo from './logo.svg';
// import './App.css';
// import ShopView from './Components/Shop';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from './Components/Auth';
import Main from './Components/Main';
import Registration from './Components/Registration';
import NotYourProfile from './Components/NotYourProfile';

function App() {
  return (
    <div className="App">

        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main/>}></Route>
          <Route path="/auth" element={<Auth/>}></Route>
          <Route path="/registration" element={<Registration/>}></Route>
          <Route path="/handler" element={<NotYourProfile/>}></Route>
        </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
