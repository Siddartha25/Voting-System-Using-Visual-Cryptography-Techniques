import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const Uploadauthenticationimage = () => {
  let navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [aadharno, setAadharno] = useState(localStorage.getItem('token'));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file1', selectedImage);
    formData.append('file2', selectedImage);
    formData.append('aadharno', aadharno);
    // console.log("hi")
    // console.log(formData)

    try {
      const response = await fetch('http://localhost:5000/authenticate', {  // Replace with your backend URL
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if(data){
        window.location.reload();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Handle errors during upload
    }
    
    

  };

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  return (
    <div>
      <h1>Upload Image</h1>
      <form onSubmit={handleSubmit} enctype="multipart/form-data">
        <label htmlFor="image">Upload your fingerprint :</label>
        <input type="file" name="file1" id="file1" accept="image/*" onChange={handleImageChange} />
        <label htmlFor="image">Upload your Share :</label>
        <input type="file" name="file2" id="file2" accept="image/*" onChange={handleImageChange} />
        <input type="text" name="aadharno" id="aadharno" value={aadharno} readOnly style={{ display: "none" }} />
        <br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Uploadauthenticationimage;
