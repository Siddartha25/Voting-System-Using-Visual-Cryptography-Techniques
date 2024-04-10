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
    <div class="container my-4">
        <div class="card card-body shadow-sm p-4">
          <h1 class="text-center mb-4">Upload Image</h1>

          <form onSubmit={handleSubmit} enctype="multipart/form-data">
            <div class="form-group">
              <label for="image" class="form-label">Select Image:</label>
              <input type="file" name="file" id="file" accept="image/*" class="form-control" onChange={handleImageChange} />
            </div>

            <input type="text" name="aadharno" id="aadharno" value={aadharno} readOnly class="form-control" style={{ display: "none" }} />

            <div class="d-grid gap-2 my-4">
              <button type="submit" class="btn btn-primary">Upload</button>
            </div>
          </form>
        </div>
  </div>
  );
};

export default Uploadimage;
