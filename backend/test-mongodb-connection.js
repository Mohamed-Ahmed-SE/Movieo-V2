import dns from 'dns/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MongoDB Connection Diagnostic Tool\n');
console.log('=' .repeat(50));

// Test 1: Check if MONGODB_URI is set
console.log('\n1️⃣ Checking MONGODB_URI...');
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  console.log('\n💡 Solution: Add MONGODB_URI to your backend/.env file');
  console.log('   Example: MONGODB_URI=mongodb://localhost:27017/movieo');
  process.exit(1);
}
console.log('✅ MONGODB_URI is set');

// Test 2: Check connection string format
console.log('\n2️⃣ Checking connection string format...');
const isAtlas = MONGODB_URI.includes('mongodb+srv://');
const isLocal = MONGODB_URI.startsWith('mongodb://localhost') || MONGODB_URI.startsWith('mongodb://127.0.0.1');

if (isAtlas) {
  console.log('✅ Using MongoDB Atlas (cloud)');
  
  // Extract hostname from connection string
  const match = MONGODB_URI.match(/mongodb\+srv:\/\/(?:[^:]+:[^@]+@)?([^/]+)/);
  if (match) {
    const hostname = match[1];
    console.log(`   Hostname: ${hostname}`);
    
    // Test 3: DNS Resolution
    console.log('\n3️⃣ Testing DNS resolution...');
    try {
      const records = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
      console.log('✅ DNS resolution successful');
      console.log(`   Found ${records.length} SRV record(s)`);
      records.forEach((record, i) => {
        console.log(`   Record ${i + 1}: ${record.name}:${record.port}`);
      });
    } catch (error) {
      console.error('❌ DNS resolution failed:', error.code);
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the MongoDB Atlas cluster is running (not paused)');
      console.log('   3. Try using a different DNS server (e.g., 8.8.8.8)');
      console.log('   4. Check if a VPN or firewall is blocking the connection');
      console.log('   5. Use local MongoDB: mongodb://localhost:27017/movieo');
    }
  }
} else if (isLocal) {
  console.log('✅ Using local MongoDB');
  console.log('   Note: Make sure MongoDB is running locally');
} else {
  console.log('⚠️  Connection string format detected');
}

// Test 4: Try to connect
console.log('\n4️⃣ Attempting connection...');
try {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
  
  const conn = await mongoose.connect(MONGODB_URI, options);
  console.log('✅ Connection successful!');
  console.log(`   Host: ${conn.connection.host}`);
  console.log(`   Database: ${conn.connection.name}`);
  console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  
  await mongoose.disconnect();
  console.log('\n✅ Disconnected successfully');
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  
  if (error.code === 'ENODATA') {
    console.log('\n💡 ENODATA Error Solutions:');
    console.log('   1. MongoDB Atlas cluster might be paused - check Atlas dashboard');
    console.log('   2. DNS resolution issue - try:');
    console.log('      • Restart your router/modem');
    console.log('      • Use Google DNS (8.8.8.8, 8.8.4.4)');
    console.log('      • Disable VPN if active');
    console.log('   3. Use local MongoDB instead:');
    console.log('      MONGODB_URI=mongodb://localhost:27017/movieo');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('\n💡 ETIMEDOUT Error Solutions:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify IP is whitelisted in MongoDB Atlas Network Access');
    console.log('   3. Check firewall settings');
  } else if (error.message.includes('authentication')) {
    console.log('\n💡 Authentication Error Solutions:');
    console.log('   1. Verify username and password in connection string');
    console.log('   2. Check database user permissions in MongoDB Atlas');
  }
  
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('✅ All tests completed!');
