import {React,useState} from 'react'
import {useNavigate} from 'react-router-dom';

function Loginpage() {
    let navigate = useNavigate();
    const [credentials, setCredentials] = useState({aadharno:"",password:""})
    const onChange = (e)=>{
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {

        e.preventDefault();
            const response = await fetch("http://localhost:5000/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({aadharno:credentials.aadharno,password:credentials.password})
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
            <label for="aadharno">Aadhaar No:</label><br/>
            <input type="text" id="aadharno" name="aadharno" required value={credentials.aadharno} onChange={onChange} /><br/>
            <label for="password">Password</label><br/>
            <input type="password" id="password" name="password" required value={credentials.password} onChange={onChange} /><br/>
            <button type="submit">Login</button>
        </form>
    </>
  )
}

export default Loginpage
