import React, { useState ,useEffect} from 'react'
import Uploadimage from './Uploadimage';
import { saveAs } from 'file-saver';
function Mydetails() {
    const [userdata,setuserdata]=useState({});
    const [userimage,setuserimage]=useState({});
    const getinfo = async () => {
        const response = await fetch("http://localhost:5000/mydetails", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({aadharno:localStorage.getItem('token')})
        });
        const json = await response.json()
        // console.log(json);
        if (json.success){
            setuserdata(json)
        }
        else{
            alert("Invalid credentials");
        }
    }
    useEffect(() => {
        getinfo()
        //eslint-disable-next-line
        // console.log(userdata)
    }, []);
    let temp=`data:format/png;base64,${userdata.imagestring}`
    // console.log(userdata)
  return (
    <>
            <div class="container my-4">
                <div class="card card-body shadow-sm p-4">
                    <h2 class="text-center mb-4">User Information</h2>

                    <div class="row g-3">
                    <div class="col-md-6">
                        <label for="aadharno" class="form-label">Aadhar Number</label>
                        <input type="text" class="form-control" id="aadharno" aria-describedby="aadharHelp" value={userdata.aadharno} readOnly />
                    </div>

                    <div class="col-md-6">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="name" value={userdata.name} readOnly />
                    </div>
                    </div>

                    <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Date of Birth</label>
                        <input type="text" class="form-control" value={userdata.dob} readOnly />
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Address</label>
                        <input type="text" class="form-control" id="address" value={userdata.address} readOnly />
                    </div>
                    </div>
                </div>
            </div>

            
            {userdata["imagestring"]===""?
                <>
                 <Uploadimage></Uploadimage>
                </>
                :
                <><div class="text-center">
                    <h4>The Share Embeded In Your Voter Id:</h4>
                    <img src={temp} alt="image from base64" />
                </div></>}
            
    </>
  )
}

export default Mydetails
