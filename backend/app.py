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


@app.route("/votenow", methods=["POST"])
def votenow():
    success=0
    if request.is_json:
        data = request.get_json()

        try:
            # Validate presence of required fields
            required_fields = {"aadharno", "team"}
            if not required_fields.issubset(data.keys()):
                return jsonify({"error": "Missing required fields in JSON data"}), 400

            # Find user in the vote collection
            existing_user = db.votes.find_one({"aadharno": data["aadharno"]})
            if existing_user:
                return jsonify({"success":success,"error": "Duplicate Aadhaar number found"}), 409
            
            votetable_data={"aadharno":data["aadharno"],"team":data["team"]}
            db.votes.insert_one(votetable_data)

            success=1
            return jsonify({"success":success,"aadharno": data["aadharno"],"message": "Vote successful!"}), 200

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

def compare_image_similarity(image1, image2):
    """
    Compares the similarity of two images using histogram correlation.

    Args:
        image1 (np.ndarray): First image as a NumPy array.
        image2 (np.ndarray): Second image as a NumPy array.

    Returns:
        float: A value between 0 (completely dissimilar) and 1 (identical)
            indicating the similarity of the images.
    """

    # Convert to grayscale if necessary
    if len(image1.shape) == 3:
        image1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
    if len(image2.shape) == 3:
        image2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)

    # Calculate histograms
    hist1 = cv2.calcHist([image1], [0], None, [256], [0, 256])
    hist2 = cv2.calcHist([image2], [0], None, [256], [0, 256])

    # Normalize histograms for better comparison
    cv2.normalize(hist1, hist1, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
    cv2.normalize(hist2, hist2, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)

    # Compare histograms using correlation
    metric_val = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

    return metric_val

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
        
        return jsonify({"message": "File uploaded successfully after decrypting","success":True})
        
#takes 2 images and authenticates
@app.route('/authenticate', methods=['POST'])
def auth():
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
        #convert to grayscale
        image_np = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        cv2.imwrite('uploads/org_image'+'.png', image_np)
        
        
        
        temp1 = db.user.find_one({"aadharno": aadharno})
        temp2 = db.admin.find_one({"aadharno": aadharno})
        
        base64_share1=temp1["imagestringuser"]
        base64_share2=temp2["imagestring"]
        
        #converting both the base64 into numpy arrays
        decoded_bytes1 = base64.b64decode(base64_share1)
        np_array1 = np.frombuffer(decoded_bytes1, np.uint8)
        image_share1 = cv2.imdecode(np_array1, cv2.IMREAD_GRAYSCALE)  
        
        
        decoded_bytes2 = base64.b64decode(base64_share2)
        np_array2 = np.frombuffer(decoded_bytes2, np.uint8)
        image_share2 = cv2.imdecode(np_array2, cv2.IMREAD_GRAYSCALE)  
        
        shares=np.array([image_share1,image_share2])
        
        final_image = decrypt(shares)
        cv2.imwrite('uploads/final_image'+'.png', final_image)
        
        similarity_score=compare_image_similarity(final_image,image_np)
        
        print(f"Similarity Score: ", similarity_score)
        
        return jsonify({"message": "File uploaded successfully after decrypting","similarity":similarity_score})



@app.route("/getshares", methods=["POST"])
def getshares():
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
            user2 = db.admin.find_one({"aadharno": data["aadharno"]})
            

            if user2:
                success=1
                return jsonify({"success":success,
                                "aadharno": data["aadharno"],
                                "imagestringuser":user1["imagestringuser"],
                                "imagestring":user2["imagestring"],}), 200
            else:
                return jsonify({"success":success,"error": "Invalid Aadhaar number"}), 401
        except Exception as e:
            return jsonify({"success":success,"error": f"Error processing login: {e}"}), 500
    else:
        return jsonify({"success":success,"error": "Request content type must be application/json"}), 415




if __name__ == "__main__":
    app.run(debug=True)
    
    
    
    
    