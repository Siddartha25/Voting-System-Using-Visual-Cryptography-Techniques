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
            alert("You have succesfully Signed in")
            navigate("/");
        }
        else{
            alert("Invalid credentials");
        }
    }

  return (
    <>
        <div class="container my-4">
            <div class="row">
                <div class="col-md-6 offset-md-3">
                <h1 class="text-center">Signup</h1>
                <form class="card shadow-sm p-4" onSubmit={handleSubmit}>
                    <div class="mb-3">
                    <label for="name" class="form-label">Name:</label>
                    <input type="text" class="form-control" id="name" name="name" required value={credentials.name} onChange={onChange} />
                    </div>

                    <div class="mb-3">
                    <label for="dob" class="form-label">Date of Birth:</label>
                    <input type="date" class="form-control" id="dob" name="dob" required value={credentials.dob} onChange={onChange} />
                    </div>

                    <div class="mb-3">
                    <label for="address" class="form-label">Address:</label>
                    <input type="text" class="form-control" id="address" name="address" required value={credentials.address} onChange={onChange} />
                    </div>

                    <div class="mb-3">
                    <label for="aadharno" class="form-label">Aadhaar No:</label>
                    <input type="text" class="form-control" id="aadharno" name="aadharno" required value={credentials.aadharno} onChange={onChange} />
                    </div>

                    <div class="mb-3">
                    <label for="password" class="form-label">Password:</label>
                    <input type="password" class="form-control" id="password" name="password" required value={credentials.password} onChange={onChange} />
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Signup</button>
                </form>
                </div>
            </div>
        </div>

    </>
  )
}

export default Login
