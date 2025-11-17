import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Test 1: Admin Login
    console.log('\n1️⃣  Testing ADMIN login...\n');
    const adminResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@furniture-mart.com',
      password: 'Admin@123456'
    });

    const adminToken = adminResponse.data.data.accessToken;
    console.log('✅ Admin Login Successful!');
    console.log(`   Token: ${adminToken.substring(0, 50)}...`);
    console.log(`   Role: ${adminResponse.data.data.admin.role}`);
    console.log(`   Email: ${adminResponse.data.data.admin.email}`);

    // Test 2: Access Protected Route with Token
    console.log('\n2️⃣  Testing Protected Route (/api/admin/profile)...\n');
    const profileResponse = await axios.get(`${API_URL}/admin/profile`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    console.log('✅ Protected Route Access Successful!');
    console.log(`   Admin ID: ${profileResponse.data.data.id}`);
    console.log(`   Name: ${profileResponse.data.data.name}`);
    console.log(`   Role: ${profileResponse.data.data.role}`);

    // Test 3: Try without token (should fail)
    console.log('\n3️⃣  Testing Protected Route WITHOUT token (should fail)...\n');
    try {
      await axios.get(`${API_URL}/admin/profile`);
    } catch (error: any) {
      console.log('✅ Correctly Rejected!');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message}`);
    }

    // Test 4: Editor Login
    console.log('\n4️⃣  Testing EDITOR login...\n');
    const editorResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'editor@furniture-mart.com',
      password: 'Editor@123456'
    });

    const editorToken = editorResponse.data.data.accessToken;
    console.log('✅ Editor Login Successful!');
    console.log(`   Role: ${editorResponse.data.data.admin.role}`);

    // Test 5: Viewer Login
    console.log('\n5️⃣  Testing VIEWER login...\n');
    const viewerResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'viewer@furniture-mart.com',
      password: 'Viewer@123456'
    });

    const viewerToken = viewerResponse.data.data.accessToken;
    console.log('✅ Viewer Login Successful!');
    console.log(`   Role: ${viewerResponse.data.data.admin.role}`);

    // Test 6: Invalid Credentials (should fail)
    console.log('\n6️⃣  Testing INVALID credentials (should fail)...\n');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@furniture-mart.com',
        password: 'WrongPassword'
      });
    } catch (error: any) {
      console.log('✅ Correctly Rejected!');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ All tests completed successfully!\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Wait a bit for server to be ready
setTimeout(testAdminLogin, 2000);
