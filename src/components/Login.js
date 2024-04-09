import {React,useState} from 'react'
import {useNavigate} from 'react-router-dom';

function Login() {
  let navigate = useNavigate();
    const [credentials, setCredentials] = useState({name: "", dob: "",address:"",aadharno:"",password:""})
    const onChange = (e)=>{
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {

        e.preventDefault();
            const response = await fetch("http://localhost:5000/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:credentials.name,dob:credentials.dob,address:credentials.address,aadharno:credentials.aadharno,password:credentials.password})
        });
        const json = await response.json()
        console.log(json);
        if (json.success){
            // Save the auth token and redirect
            localStorage.setItem('token', json.aadharno); 
            alert("You have succesfully logged in")
            navigate("/");
        }
        else{
            alert("Invalid credentials");
        }
    }

  return (
    <>
     <h1>Signup</h1>
        <form onSubmit={handleSubmit}>
            <label for="name">Name:</label><br/>
            <input type="text" id="name" name="name" required value={credentials.name} onChange={onChange} /><br/>
            <label for="dob">Date of Birth:</label><br/>
            <input type="date" id="dob" name="dob" required value={credentials.dob} onChange={onChange} /><br/>
            <label for="address">Address:</label><br/>
            <input type="text" id="address" name="address" required value={credentials.address} onChange={onChange} /><br/>
            <label for="aadharno">Aadhaar No:</label><br/>
            <input type="text" id="aadharno" name="aadharno" required value={credentials.aadharno} onChange={onChange} /><br/>
            <label for="password">Password</label><br/>
            <input type="password" id="password" name="password" required value={credentials.password} onChange={onChange} /><br/>
            <button type="submit">Signup</button>
        </form>
    </>
  )
}

export default Login
