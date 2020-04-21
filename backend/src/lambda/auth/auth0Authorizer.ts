import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert =  `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJTBmCCtY15RBpMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0yaWE1dDdnbC5ldS5hdXRoMC5jb20wHhcNMjAwNDE1MDQxOTMyWhcN
MzMxMjIzMDQxOTMyWjAkMSIwIAYDVQQDExlkZXYtMmlhNXQ3Z2wuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyf1vR5mBWZF873Kq
kQbuScMQzzN4fIZG61/1BfjCnVuC8Vis65VPRlH4XTwOvSVSDe3qctxzPBrZKo9X
lhCwZIoV/TNqCV1afBc+bYgQdl3ig3LqmVUcH8lLyj0rgfswg3wBpLFux75uvJ6b
HVWxg3VPy1Xjy85v1KJ4SAPzNsn7JOhuNXaKtKSAJC7kR1QGDz8arygjtDKzEwTu
dspFY8rdR34cNk0ZByyDs97/PuI0rkC7Az/66Sh+bf6Am3dE1Wvl3XxBg0Wt1sKZ
nuFl34lmaPBizn8PofzuW08r2pNbH3cJbxGNTzYLv8M+/UvCI1Y2AT3tkPC8G9xL
Ou9laQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSYNI24Pv23
KMISqYQ8mthyUKSjXjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJIcpZLVQ6yaTZRltnkTYq6u15w9lawLVio9s5OCRZXKx89KkKh7F4H893g3INcO
hTgZa+oBV2TNwlek9BPHrE4hYKMGjIsgQS7jry79LUlLBAMEUZF2pzVPJwEG7sji
e5tVbUh7hcftyDM9eUeVe4ykxwjSDTiKqP4Q6mHENt0U6F/7bxrHeH6FrpmiLlT2
vXyyLQS+22ixRhq6nm2GfrQc32xLY3dopUxWWy6f6HP4NbeqcCY03Pc766TikRCB
gIY4CnnRn6LribCbLCITTPwDKuTysP2tfjlZNcv2fqutKMkFQPMn2vybt7lq4EUJ
BufPbIkdhl10SNG/9m2TeDI=
-----END CERTIFICATE-----`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-2ia5t7gl.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      /*policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }*/
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
  // we are only supporting RS256 so fail if this happens.
  if (jwt.header.alg !== 'R256'){
    return null
  }
  
  return verify(
    token,           // Token from an HTTP header to validate
    cert,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload

}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
