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
    console.log(userdata)
    // const handleDownloadClick = () => {
    //     const contentType = 'image/png';  // Specify content type for JPG
    //     const base64Data = temp.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    //     const byteString = atob(base64Data);
    //     const mimeString = contentType;
    
    //     const blob = new Blob([new Uint8Array(byteString)], { type: mimeString });
    //     const link = document.createElement('a');
    //     link.href = URL.createObjectURL(blob);
    //     link.setAttribute('download', 'image.png'); // Ensure .jpg extension
    //     link.click();
    //   };
    const handleDownloadClick = () => {
        const contentType = 'image/png';
        const base64Data = temp.split(',')[1]; // Remove prefix
        const byteString = atob(base64Data);
        const mimeString = contentType;
    
        const blob = new Blob([new Uint8Array(byteString)], { type: mimeString });
        saveAs(blob, 'image.png');  // Use file-saver for download
      };
  return (
    <>
        {/* <form> */}
            <div class="mb-3">
                <label for="aadharno" >Aadhar Number</label>
                <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={userdata.aadharno} readOnly />
            </div>
            <div class="mb-3">
                <label for="name" >Name</label>
                <input type="text" class="form-control" id="exampleInputPassword1" value={userdata.name} readOnly/>
            </div>
            <div class="mb-3 form-check">
                <label >Date Of Birth</label>
                <input type="text" class="form-control" id="exampleInputPassword1" value={userdata.dob} readOnly/>
            </div>
            <div class="mb-3 form-check">
                <label >Address</label>
                <input type="text" class="form-control" id="exampleInputPassword1" value={userdata.address} readOnly/>
            </div>
            
            {userdata["imagestring"]===""?
                <>
                 <Uploadimage></Uploadimage>
                </>
                :
                <><img src={temp} alt="image from base64" />
                    <button onClick={handleDownloadClick}>Download</button></>}
            
        {/* </form> */}
    </>
  )
}
{/* <>
                    <h1>Upload Image</h1>
                    <form action="http://localhost:5000/upload" method="POST" enctype="multipart/form-data">
                        <label for="image">Select Image:</label>
                        <input type="file" name="file" id="file" accept="image/*"/>
                        <input type="text" name="aadharno" id="aadharno" value={localStorage.getItem('token')} readOnly style={{display:"none"}}/>
                        <br/>
                        <button type="submit">Upload</button>
                    </form></>  */}


export default Mydetails
