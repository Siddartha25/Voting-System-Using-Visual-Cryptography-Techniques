import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Loginpage from './components/Loginpage';
import Mydetails from './components/Mydetails';
import Authenticate from './components/Authenticate';
import Votingpage from './components/Votingpage';


function App() {
  return (
    <>
      <BrowserRouter>
          <Navbar></Navbar>
          <div className="container">
            <Routes>
              <Route path="/" element={<Home></Home>}></Route>
              <Route path="/signup" element={<Login></Login>}></Route>
              <Route path="/login" element={<Loginpage></Loginpage>}></Route>
              <Route path="/mydata" element={<Mydetails></Mydetails>}></Route>
              <Route path="/vote" element={<Authenticate></Authenticate>}></Route>
              <Route path="/votenow" element={<Votingpage></Votingpage>}></Route>
            </Routes>
          </div>
        </BrowserRouter>
    </>
  );
}

export default App;
