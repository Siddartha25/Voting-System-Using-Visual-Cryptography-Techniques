import {React,useState,useEffect }from 'react'
import Uploadauthenticationimage from './Uploadauthrnticationimage'

function Authenticate() {

  const [shares,setshares]=useState({});

  const getshares = async () => {
      const response = await fetch("http://localhost:5000/getshares", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({aadharno:localStorage.getItem('token')})
      });
      const json = await response.json()
      // console.log(json);
      if (json.success){
          setshares(json)
      }
      else{
          alert("Invalid credentials");
      }
  }

  useEffect(() => {
    getshares()
    //eslint-disable-next-line
    // console.log(userdata)
}, []);

let temp1=`data:format/png;base64,${shares.imagestring}`
let temp2=`data:format/png;base64,${shares.imagestringuser}`


  return (
    <>  
            <div class="container my-4">
                <div class="row g-4">
                    <div class="col-md-6">
                    <div class="text-center">
                        <h5>The image obtained from Admin Database</h5>
                        <img src={temp1} alt="image from base64 the image in admin db" class="img-fluid" />
                    </div>
                    </div>

                    <div class="col-md-6">
                    <div class="text-center">
                        <h5>The image obtained from Voter ID</h5>
                        <img src={temp2} alt="image from base64 the image obtained from the voter id ie user share" class="img-fluid" />
                    </div>
                    </div>
                </div>
            </div>
        <Uploadauthenticationimage></Uploadauthenticationimage>
    </>
  )
}

export default Authenticate
