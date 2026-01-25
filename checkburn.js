const { createPublicClient, http, parseAbi } = require('viem');
const { sepolia } = require('viem/chains');

const CONTRACT_ADDRESS = '0x6d21cde83710ABdB6FBb0881712e38DFbb3aa1B4';
const USER_ADDRESS = '0xB7EEbCC43E97Ec77658F43865b235C1438e465Af';

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function checkStatus() {
  console.log('🔍 Checking contract status...\n');
  
  // 1. Check if paused
  console.log('1️⃣ Pause Status:');
  try {
    const paused = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function paused() view returns (bool)']),
      functionName: 'paused',
    });
    console.log(`   Paused: ${paused ? '🔴 YES - CONTRACT IS PAUSED!' : '🟢 NO'}`);
    
    if (paused) {
      console.log('   ⚠️  This is why burn() fails! Contract must be unpaused.');
    }
  } catch (error) {
    console.log('   Error checking paused:', error.shortMessage);
  }
  
  // 2. Check owner
  console.log('\n2️⃣ Owner:');
  try {
    const owner = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function owner() view returns (address)']),
      functionName: 'owner',
    });
    console.log(`   Owner: ${owner}`);
    console.log(`   User:  ${USER_ADDRESS}`);
    console.log(`   User is owner? ${owner.toLowerCase() === USER_ADDRESS.toLowerCase()}`);
  } catch (error) {
    console.log('   Error:', error.shortMessage);
  }
  
  // 3. Check BURNER_ROLE
  console.log('\n3️⃣ BURNER_ROLE:');
  try {
    const burnerRole = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function BURNER_ROLE() view returns (bytes32)']),
      functionName: 'BURNER_ROLE',
    });
    console.log(`   BURNER_ROLE hash: ${burnerRole}`);
    
    // Check if user has the role
    const hasRole = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function hasRole(bytes32 role, address account) view returns (bool)']),
      functionName: 'hasRole',
      args: [burnerRole, USER_ADDRESS]
    });
    console.log(`   User has BURNER_ROLE? ${hasRole ? '✅ YES' : '❌ NO'}`);
    
    if (!hasRole) {
      console.log('   ⚠️  User needs BURNER_ROLE to burn tokens!');
    }
  } catch (error) {
    console.log('   Error:', error.shortMessage);
  }
  
  // 4. Check DEFAULT_ADMIN_ROLE
  console.log('\n4️⃣ DEFAULT_ADMIN_ROLE:');
  try {
    const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const hasRole = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function hasRole(bytes32 role, address account) view returns (bool)']),
      functionName: 'hasRole',
      args: [adminRole, USER_ADDRESS]
    });
    console.log(`   User has DEFAULT_ADMIN_ROLE? ${hasRole ? '✅ YES' : '❌ NO'}`);
  } catch (error) {
    console.log('   Error:', error.shortMessage);
  }
}

checkStatus().catch(console.error);