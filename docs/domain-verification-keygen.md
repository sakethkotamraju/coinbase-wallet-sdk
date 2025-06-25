# Coinbase Domain Verification Key Generation Script

This script generates a secp256k1 key pair and outputs a JWKS (JSON Web Key Set) file for Coinbase domain verification, as well as a private key for signing.

## What is JWKS?

JWKS (JSON Web Key Set) is an industry standard format (RFC 7517) for representing cryptographic keys in JSON. It's widely used in OAuth 2.0, OpenID Connect, and other security protocols.

### Why JWKS instead of simple JSON?

- **Industry Standard**: IETF standard format used by major platforms
- **Rich Metadata**: Includes algorithm, usage, and key identification
- **Key Rotation**: Can contain multiple keys for seamless rotation
- **Interoperability**: Works with standard JWT libraries and tools
- **Base64URL Encoding**: URL-safe encoding for key components

## Where is the Public Key?

Your public key is stored as **x and y coordinates** in the JWKS:

```json
{
  "x": "base64url-encoded-x-coordinate",
  "y": "base64url-encoded-y-coordinate"
}
```

### How to Reconstruct the Full Public Key:

The full public key is: `04 + [x-coordinate] + [y-coordinate]`

- `04` = uncompressed point prefix
- `x` = 32-byte x-coordinate (base64url decoded)
- `y` = 32-byte y-coordinate (base64url decoded)

**Total: 65 bytes** (1 + 32 + 32)

## What does it do?
- Generates a secp256k1 key pair
- Outputs a `.well-known/jwks.json` file in the current directory (for hosting at `https://yourdomain.com/.well-known/jwks.json`)
- Outputs a `domain-verification-private-key.txt` file (for secure storage and use with the SDK)

## Usage

From the root directory of the repo, run:

```sh
yarn generate-domain-keys
```

## Output
- `.well-known/jwks.json`: Public key in JWKS format for domain verification
- `domain-verification-private-key.txt`: Private key (keep this secure!)

## Next Steps
1. **Host** the `jwks.json` file at `https://yourdomain.com/.well-known/jwks.json`
2. **Store** the private key securely for use with the SDK
3. **Use** the private key with the SDK's `generateSignature` function for domain verification

## Example JWKS Output
```json
{
  "version": "1.0",
  "keys": [
    {
      "kty": "EC",
      "crv": "secp256k1",
      "x": "base64url-encoded-x-coordinate",
      "y": "base64url-encoded-y-coordinate",
      "use": "sig",
      "kid": "coinbase-domain-verification",
      "alg": "ES256K"
    }
  ]
}
```

### JWKS Field Descriptions:
- `version`: Format version for tracking changes
- `kty`: Key type ("EC" for Elliptic Curve)
- `crv`: Curve name ("secp256k1" for Bitcoin/Ethereum curve)
- `x`, `y`: Base64URL-encoded x and y coordinates of the public key
- `use`: Key usage ("sig" for signing)
- `kid`: Key ID for identification ("coinbase-domain-verification")
- `alg`: Algorithm ("ES256K" for ECDSA with secp256k1 and SHA-256)

## Why?
This enables secure domain verification for Coinbase Wallet SDK integrations. The SDK will use the private key to sign requests, and Coinbase will verify signatures using the public key hosted at your domain.

---
**Keep your private key safe!** Never share it or commit it to source control. 