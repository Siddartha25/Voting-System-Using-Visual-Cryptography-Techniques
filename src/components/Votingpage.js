import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Votingpage() {
//   const [team_name, setteam_name] = useState("");
let temp_name="";
  let temp = localStorage.getItem("token");
  let navigate = useNavigate();

  const handleSubmit = async () => {
    // e.preventDefault();
    const response = await fetch("http://localhost:5000/votenow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ aadharno: temp, team: temp_name }),
    });
    const json = await response.json();
    // console.log(json);
    if (json.success) {
      // Save the auth token and redirect
      alert("You have succesfully Voted!!");
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <div class="container my-4">
            <div class="row g-4">
                <div class="col-md-6">
                <div class="card shadow-sm">
                    <img src="https://styles.redditmedia.com/t5_3mrl9/styles/communityIcon_vo91tomlegn41.png" class="card-img-top" alt="Red Team" style={{height:"500px", width:"500px"}}/>
                    <div class="card-body">
                    <h5 class="card-title">Red Team: Unite for a Stronger Tomorrow!</h5>
                    <p class="card-text">
                        Comrades, the time has come to stand together against the forces of oppression! Our Red Team represents the true spirit of equality, solidarity, and progress
                    </p>
                    <button type="button" class="btn btn-primary" onClick={() => {temp_name="blue team";handleSubmit()} }>Vote Now</button>
                    </div>
                </div>
                </div>

                <div class="col-md-6">
                <div class="card shadow-sm">
                    <img src="https://www.desktopbackground.org/p/2015/09/06/1007071_made-the-blue-team-shirt-into-a-wallpaper-roosterteeth_8000x4500_h.png" class="card-img-top " style={{height:"500px", width:"500px"}} alt="Blue Team"/>
                    <div class="card-body">
                    <h5 class="card-title">Blue Team: Protect Our Values, Secure Our Future!</h5>
                    <p class="card-text">
                        Fellow citizens, the time has come to defend the principles that make our nation great! The Blue Team stands as a beacon of freedom, democracy, and prosperity.
                    </p>
                    <button type="button" class="btn btn-primary" onClick={() => {temp_name="blue team";handleSubmit()} }>Vote Now</button>
                    </div>
                </div>
                </div>
            </div>
        </div>

    </>
  );
}

export default Votingpage;
