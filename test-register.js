// Simple script to test the registration API
const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
    // Test the auth/me endpoint with the token
    const token = response.data.token;
    const userResponse = await axios.get('http://localhost:5001/api/auth/me', {
      headers: {
        'x-auth-token': token
      }
    });
    
    console.log('\nUser data:');
    console.log(userResponse.data);
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegister(); 