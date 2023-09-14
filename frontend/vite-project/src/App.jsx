
import './App.css'
import Footer from './components/footer';
import Header from './components/header'
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from './components/Home/Home';
function App() {
  

  return (
    <Router>
      <Header/>
      <Route exact path ="/" compomemt={Home}/>
      <Footer/>
    </Router>
  )
}

export default App
