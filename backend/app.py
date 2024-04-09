from flask import Flask, request, Response,jsonify, redirect, url_for
from pymongo import MongoClient
from io import BytesIO
import base64
import cv2 ,os,io 
import numpy as np

app = Flask(__name__)
from flask_cors import CORS, cross_origin
CORS(app, support_credentials=True)


# Replace with your MongoDB connection string
mongo_uri = 'mongodb+srv://Siddartha:JmYcfrpYIOm4YOBP@clustersid.jmxh0db.mongodb.net/'
client = MongoClient(mongo_uri)
db = client.get_database("votingsystem")  # Specify the database name

signup_schema = {
    "name": {"type": "string", "required": True},
    "dob": {"type": "date", "required": True},
    "address": {"type": "string", "required": True},
    "aadharno": {"type": "string", "required": True},
    "password": {"type": "string", "required": True}
}

admin_schema = {
    "aadharno": {"type": "string", "required": True},
    "imagestring": {"type": "string", "required": True}
}

user_schema = {
    "aadharno": {"type": "string", "required": True},
    "imagestringuser": {"type": "string", "required": True}
}

@app.route("/signup", methods=["POST"])
def signup():
    success=False
    if request.is_json:
        data = request.get_json()

        try:
            # Validate data against expected fields (optional but recommended)
            expected_fields = {"name", "dob", "address", "aadharno","password"}
            if not expected_fields.issubset(data.keys()):
                return jsonify({"success":success,"error": "Missing required fields in JSON data"}), 400

            # Check for duplicate Aadhaar number
            existing_user = db.signup.find_one({"aadharno": data["aadharno"]})
            if existing_user:
                return jsonify({"success":success,"error": "Duplicate Aadhaar number found"}), 409

            # Save data in the signup collection
            db.signup.insert_one(data)
            
            #we do this so tht whenever somone signsup his details should also be updated in the admin part where a share of the image will be stored
            imagetable_data={"aadharno":data["aadharno"],"imagestring":""}
            db.admin.insert_one(imagetable_data)
            
            imagetable_data={"aadharno":data["aadharno"],"imagestringuser":""}
            db.user.insert_one(imagetable_data)
            
            success=1
            return jsonify({"success":success,"message": "Signup successful!","aadharno":data["aadharno"]}), 201
        except Exception as e:
            return jsonify({"error": f"Error saving data: {e}"}), 500
    else:
        return jsonify({"success":success,"error": "Request content type must be application/json"}), 415


@app.route("/login", methods=["POST"])
def login():
    success=0
    if request.is_json:
        data = request.get_json()

        try:
            # Validate presence of required fields
            required_fields = {"aadharno", "password"}
            if not required_fields.issubset(data.keys()):
                return jsonify({"error": "Missing required fields in JSON data"}), 400

            # Find user in the signup collection
            user = db.signup.find_one({"aadharno": data["aadharno"], "password": data["password"]})

            if user:
                success=1
                return jsonify({"success":success,"aadharno": data["aadharno"],"message": "Login successful!"}), 200
            else:
                return jsonify({"success":success,"error": "Invalid Aadhaar number or password"}), 401
        except Exception as e:
            return jsonify({"success":success,"error": f"Error processing login: {e}"}), 500
    else:
        return jsonify({"success":success,"error": "Request content type must be application/json"}), 415

@app.route("/mydetails", methods=["POST"])
def mydetails():
    success=0
    if request.is_json:
        data = request.get_json()

        try:
            # Validate presence of required fields
            required_fields = {"aadharno"}
            if not required_fields.issubset(data.keys()):
                return jsonify({"error": "Missing required fields in JSON data"}), 400

            # Find user in the signup collection
            user1 = db.user.find_one({"aadharno": data["aadharno"]})
            user2 = db.signup.find_one({"aadharno": data["aadharno"]})
            

            if user2:
                success=1
                return jsonify({"success":success,
                                "aadharno": data["aadharno"],
                                "imagestring":user1["imagestringuser"],
                                "address":user2["address"],
                                "dob":user2["dob"],
                                "name":user2["name"]}), 200
            else:
                return jsonify({"success":success,"error": "Invalid Aadhaar number"}), 401
        except Exception as e:
            return jsonify({"success":success,"error": f"Error processing login: {e}"}), 500
    else:
        return jsonify({"success":success,"error": "Request content type must be application/json"}), 415



UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def save_shares_as_base64(share, file_name):
    share_contiguous = np.ascontiguousarray(share)
    print("here : ",share_contiguous.shape)
    # Convert share to Base64 string
    base64_share = base64.b64encode(share_contiguous).decode('utf-8')
    # Save share to a text file
    with open(file_name, 'w') as text_file:
        text_file.write(base64_share)

def read_base64_image(file_name, image_shape):
    # Read Base64 string from text file
    with open(file_name, 'r') as text_file:
        base64_image = text_file.read()
    # Convert Base64 string back to binary data
    image_data = base64.b64decode(base64_image)
    # Convert binary data to NumPy array
    np_array = np.frombuffer(image_data, dtype=np.uint8)
    # Reshape the NumPy array to the original image shape
    np_array = np_array.reshape(image_shape)
    return np_array



def encrypt(img_array, num_shares):
    (row,column) = img_array.shape
    shares = np.random.randint(0,256,size = (num_shares,row,column))
    shares[-1,:,:] = img_array
    for i in range(num_shares-1):
        shares[-1,:,:] = (shares[-1,:,:] + shares[i,:,:])%256
    
    return shares


def decrypt(shares):
    (num_shares, row, column) = shares.shape
    for i in range(num_shares-1):
        shares[-1,:,:] = (shares[-1,:,:]-shares[i,:,:]-256)%256
    return shares[-1,:,:]



@app.route('/upload', methods=['POST'])
def upload_file():
    """basically what we do is that we convert the orginal image into greyscale and then split it into 2 shares
    one share we put in admin table and another we put in user table"""
    if 'file' not in request.files:
        return 'No file part'
    # file = request.files['file']
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    if file:
        aadharno=request.form.get("aadharno")
        image_data = file.read()  #image data is sequence of bytes
        np_array = np.frombuffer(image_data, np.uint8)  

        
        image_np = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        # cv2.imwrite('uploads/input_image'+'.png', image_np)

        #convert to grayscale
        image_np = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)

        #encrypt image
        shares = encrypt(image_np, 2)

        shares = shares.astype(np.uint8)
        
        # final_image = decrypt(shares)
        # print("final image : ",final_image.shape)

        # #save the image
        # cv2.imwrite('uploads/final_image'+'.png', final_image)
        
        # one will go to the user and one to the admin
        _, buffer = cv2.imencode('.jpg', shares[0])
        base64_string = base64.b64encode(buffer.tobytes()).decode("utf-8")
        db.user.update_one({"aadharno": aadharno}, {"$set": {"imagestringuser": base64_string}})
        
        _, buffer = cv2.imencode('.jpg', shares[1])
        base64_string = base64.b64encode(buffer.tobytes()).decode("utf-8")
        db.admin.update_one({"aadharno": aadharno}, {"$set": {"imagestring": base64_string}})
        
        
#takes 2 images and authenticates
@app.route('/authenticate', methods=['POST'])
def auth():
    if 'file1' not in request.files:
        return 'No file part'
    # file = request.files['file']
    file1 = request.files['file1']
    file2 = request.files['file2']
    if file1.filename == '':
        return 'No selected file'
    if file1:
        aadharno=request.form.get("aadharno")
        image_orginal = file1.read()  #this is the actual fingerprint
        np_array_org = np.frombuffer(image_orginal, np.uint8)  
        image_orginal = cv2.imdecode(np_array_org, cv2.IMREAD_COLOR)
        #convert to grayscale
        image_orginal = cv2.cvtColor(image_orginal, cv2.COLOR_BGR2GRAY)
        
        cv2.imwrite('uploads/input_image'+'.png', image_orginal)
        
        
        admin = db.admin.find_one({"aadharno": aadharno})
        base64_string_admin=admin["imagestring"]
        decoded_bytes = base64.b64decode(base64_string_admin)
        # Convert bytes back to a numpy array
        np_array1 = np.frombuffer(decoded_bytes, np.uint8)
        # Decode the image using OpenCV
        image_np1 = cv2.imdecode(np_array1, cv2.IMREAD_GRAYSCALE)
        
        
        image_data2 = file2.read()  #this is the share uploaded by the user
        np_array2 = np.frombuffer(image_data2, np.uint8)  
        image_np2 = cv2.imdecode(np_array2, cv2.IMREAD_COLOR)

        final_image = decrypt([image_np1,image_np2])

        cv2.imwrite('uploads/final_image'+'.png', final_image)
        
        
        


        return jsonify({"message": "File uploaded successfully after decrypting"})


if __name__ == "__main__":
    app.run(debug=True)
    
    
    
    
    