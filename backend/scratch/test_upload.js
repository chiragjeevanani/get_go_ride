import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function runTest() {
  try {
    // 1. Admin login
    console.log("Logging in as admin...");
    const loginRes = await axios.post('http://localhost:5001/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: '1234qwer'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log("Logged in successfully! Token received:", token ? "YES" : "NO");

    // Ensure scratch directory exists
    const scratchDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    // Create a temporary dummy file to upload
    const dummyPath = path.join(scratchDir, 'dummy.png');
    fs.writeFileSync(dummyPath, 'fake-image-bytes-content');

    // 2. Try uploading
    console.log("Uploading file to /api/upload/image...");
    const form = new FormData();
    form.append('image', fs.createReadStream(dummyPath));

    const uploadRes = await axios.post('http://localhost:5001/api/upload/image', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log("Upload Success response:", uploadRes.data);
    fs.unlinkSync(dummyPath);
  } catch (err) {
    console.error("Upload failed with error!");
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error message:", err.message);
    }
  }
}

runTest();
