#!/usr/bin/env node

import { secp256k1 } from '@noble/curves/secp256k1';
import { randomBytes } from '@noble/hashes/utils';
import base64url from 'base64url';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

function generateDomainVerificationKeys() {
  // Generate a random private key
  const privateKeyBytes = randomBytes(32);
  const privateKey = base64url(Buffer.from(privateKeyBytes));
  
  // Get the uncompressed public key from the private key
  const publicKey = secp256k1.getPublicKey(privateKeyBytes, false); // false = uncompressed
  
  // Extract x and y coordinates from the public key
  // secp256k1 uncompressed public key is 65 bytes: 1 byte prefix + 32 bytes x + 32 bytes y
  const x = base64url(Buffer.from(publicKey.slice(1, 33)));
  const y = base64url(Buffer.from(publicKey.slice(33)));
  
  // Create the JWK
  const jwk = {
    kty: 'EC',
    crv: 'secp256k1',
    x,
    y,
    use: 'sig',
    kid: 'coinbase-domain-verification',
    alg: 'ES256K'
  };
  
  // Create the JWKS
  const jwks = {
    version: "1.0",
    keys: [jwk]
  };
  
  return { jwks, privateKey };
}

function main() {
  try {
    console.log('🔑 Generating Coinbase domain verification keys...\n');
    
    const { jwks, privateKey } = generateDomainVerificationKeys();
    
    // Create .well-known directory if it doesn't exist
    const wellKnownDir = join(process.cwd(), '.well-known');
    mkdirSync(wellKnownDir, { recursive: true });
    
    // Write the JWKS file
    const jwksPath = join(wellKnownDir, 'jwks.json');
    writeFileSync(jwksPath, JSON.stringify(jwks, null, 2));
    
    // Write the private key to a separate file
    const privateKeyPath = join(process.cwd(), 'domain-verification-private-key.txt');
    writeFileSync(privateKeyPath, privateKey);
    
    console.log('✅ Successfully generated domain verification keys!\n');
    console.log('📁 Files created:');
    console.log(`   • ${jwksPath} - JWKS file for your domain`);
    console.log(`   • ${privateKeyPath} - Private key (keep this secure!)\n`);
    
    console.log('🌐 Next steps:');
    console.log('   1. Host the jwks.json file at: https://yourdomain.com/.well-known/jwks.json');
    console.log('   2. Store the private key securely for use with the SDK');
    console.log('   3. Use the private key with the SDK\'s generateSignature function\n');
    
    console.log('📋 JWKS content:');
    console.log(JSON.stringify(jwks, null, 2));
    
  } catch (error) {
    console.error('❌ Error generating domain verification keys:', error);
    process.exit(1);
  }
}

main(); 