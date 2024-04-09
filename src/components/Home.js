import React from 'react'
import Login from './Login'
import {Link} from 'react-router-dom'

function Home() {
  return (
    <>
    <div className="container">
    <div class="card" style={{width: "18rem"}}>
      <div class="card-body">
        <h5 class="card-title">Check Details</h5>
        <p class="card-text">You can check your data here </p>
        <Link to="/mydata" class="btn btn-primary">My Data</Link>
      </div>
    </div>
    <div class="card" style={{width: "18rem"}}>
      <div class="card-body">
        <h5 class="card-title">Vote Now</h5>
        <p class="card-text">You can vote here.</p>
        <Link to="/vote" class="btn btn-primary">Lets vote</Link>
      </div>
    </div>
    </div>
    </>
  )
}

export default Home
