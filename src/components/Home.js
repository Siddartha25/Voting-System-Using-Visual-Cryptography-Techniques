import React from 'react'
import { useContext, useEffect } from "react";
import Login from './Login'
import {useNavigate,Link} from 'react-router-dom';


function Home() {
  let navigate = useNavigate();

  useEffect(() => {
    /*if the auth token in localstorgae is not null then only we getnotes otherwise we send him to login */
    if(localStorage.getItem('token')){
    }
    else{
        navigate("/login");
    }
    //eslint-disable-next-line
  }, []);

  return (
    <>
    <div class="container my-4">
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Check Details</h5>
              <p class="card-text">You can check your data here.</p>
              <a href="/mydata" class="btn btn-primary">My Data</a>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Vote Now</h5>
              <p class="card-text">You can vote here.</p>
              <a href="/vote" class="btn btn-primary">Let's Vote</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Home
