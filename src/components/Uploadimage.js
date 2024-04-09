import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const Uploadimage = () => {
  let navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [aadharno, setAadharno] = useState(localStorage.getItem('token'));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('aadharno', aadharno);
    // console.log("hi")
    // console.log(formData)

    try {
      const response = await fetch('http://localhost:5000/upload', {  // Replace with your backend URL
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
        <label htmlFor="image">Select Image:</label>
        <input type="file" name="file" id="file" accept="image/*" onChange={handleImageChange} />
        <input type="text" name="aadharno" id="aadharno" value={aadharno} readOnly style={{ display: "none" }} />
        <br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Uploadimage;
