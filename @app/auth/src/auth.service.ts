import { Injectable } from '@nestjs/common';
import { str, envsafe, port } from 'envsafe';
import * as jwt from 'jsonwebtoken';
import { JwtClaims } from './types';

import * as path from 'path';
import debug from 'debug';
import { pkg } from './utils/environment';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

const devPrivateKay = `
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAwO9zGPEexhaT9ix02iH0Zl2HDEGrH5k4nHjVT2Q0sMqlImG5
EFCRq9RDIzGZPv2IJ1ohOjASmGGgzgcbX8aOIgV8wnwht9Wf6ZSu4xAiEWFN0P8Z
M2W/C76CnIoQTd/jZlmZwATfjbIM7HGtbgfpUj+HY2rG1WgiM29tHo1wjXMlD8iA
S8087KrA+QPJZiW/gAzQdFtQIaT67xCawmzxgAa+8lMPJVKUC894VrbPVXoBzYdp
CExyCBpJiXvZccmIN/M22xUeIcf9EIKTDXAiaRPCPpp/onbCmnYqCAbYmnYuOB8d
3jXeO/cBXiTfmK3Tv7LDYSVKhjhzQF5lpVls5wIDAQABAoIBABTekdOj2VFSBeU9
/9HMlHQyL7Z6r/j2CPKb+27gBvcMpHoome0S2f79MdnvtoTixcSD8k4p/wjunodK
q4Jbpuo1L76V0Mvi1q5cf+Jdz2GT5efygBZYLicmD1jBcmwKCL38eS4VGN1p4g39
aeYaAvn7lziAx0s0PWbU6bfBUuhp2QcO4Mn4WsTcvoQhfPW/IHfFiR6qPdixt8Y/
O2J2+VcLBn/NBDYVwSUV9AyIKBXZhdkUslXMqtiXKxYkF5JQA58EaUMmnsHxtiii
8KRVmfGsm5SdPMU5A582vRREk0vfPnc4+l7SXDC9f0rM4Yh1Prj3NSBUbALt4I7J
jfSXS2ECgYEA3mjOuUhpb21LO/zrV5MD66O5v94+ZT3RCSEGAMlF4Lvy8rVVC5zW
cg0368259YhdGhrwdZTDA8LEE0ZlKLD47HULPxA2P32PoZgbC+je/rI7vmxy6WT1
c+37Xz/doE2ene3d4HjvstHQiytsfu+A2waclCKJvPdrgPosOy/duxECgYEA3hMQ
LCtTKhTlRAX0OIGNJULrWq55x6WMyVMBse04+/byRBnomUmBnRIpSxUGEsAEr0S3
ZqGwMSjX+Z5NRDidQligYh9zJmmOjbnfVqJWVrHgYj8cqsWDApzwN/w2F3U7cCIe
OcFoAaENXMzp1uFWmj7inOXuoo//DXqXQOEf+HcCgYBqK5QLhNK4G29fupPJ4Wds
tGK2gew9Pi4scnRAKdTOvEn0rLVlbsA7/61jRnjwCeGP1a5WIuaZQ/9/yAoAS8L4
dcMhnqaW1mSbWlYG8GqLISA9/d05JzW42rE1vfIZVRRUBbn2LyUVsu0fkmIfkktr
wxM57+baqy3JiyNUObxaUQKBgA22oaYImt8bYTj9ISKoJV4qrrvv0Eda2sHH5W/m
VUGB813vN6TXnDBl4bToPHLF9sQX+zdUPrwaaJPaiazvzg49yNGmXYb+t7Xax4bj
CW/bFh8bBJsrDTcJF/BtG64BKEV5ZeJtJg4LsvaLFNmXGrD1tyq3LDBPshFUA6kW
/dFrAoGAIdRIwt7+zZ59Fn5BckNoqrkSPfB19t67OXP+Ls+fT1+0KegyU3mJU+nV
0aM2zYmhqhOCtVmBAbWEl6lRQEPZwYuYMmUdBUEk4OgrCrf9vJ6AHgNzE+8RoUR4
rrr80d8gjAAwIvQU25S3Mfew+wB1vHfn7rIqe+Zs68d6rBohvCg=
-----END RSA PRIVATE KEY-----
`;

const devPublicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwO9zGPEexhaT9ix02iH0
Zl2HDEGrH5k4nHjVT2Q0sMqlImG5EFCRq9RDIzGZPv2IJ1ohOjASmGGgzgcbX8aO
IgV8wnwht9Wf6ZSu4xAiEWFN0P8ZM2W/C76CnIoQTd/jZlmZwATfjbIM7HGtbgfp
Uj+HY2rG1WgiM29tHo1wjXMlD8iAS8087KrA+QPJZiW/gAzQdFtQIaT67xCawmzx
gAa+8lMPJVKUC894VrbPVXoBzYdpCExyCBpJiXvZccmIN/M22xUeIcf9EIKTDXAi
aRPCPpp/onbCmnYqCAbYmnYuOB8d3jXeO/cBXiTfmK3Tv7LDYSVKhjhzQF5lpVls
5wIDAQAB
-----END PUBLIC KEY-----
`;

const JWT_ALGORITHM = 'RS512';
@Injectable()
export class AuthService {
    public readonly env = envsafe({
        PRIVATE_KEY: str({
            devDefault: devPrivateKay,
        }),
        PUBLIC_KEY: str({
            devDefault: devPublicKey,
        })
    }, {
        strict: true
    });
    constructor() { }

    public async createToken(claims: JwtClaims<string, number>) {
        return new Promise<string>((resolve, reject) => {
            jwt.sign(claims, this.env.PRIVATE_KEY, { algorithm: JWT_ALGORITHM }, (err, token) => {
                if (err || !token) {
                    return reject(err || 'token is undefined');
                }
                return resolve(token);
            });
        });
    }

    public async verifyToken(token: string) {
        return new Promise<JwtClaims<string, number> | undefined>((resolve, reject) => {
            jwt.verify(token, this.env.PRIVATE_KEY, { algorithms: [JWT_ALGORITHM] }, (err, decoded) => {
                if (err) {
                    if (err instanceof jwt.JsonWebTokenError) {
                        // JWT malformed
                        return reject(undefined);
                    }
                    return reject(err || 'decoded is undefined');
                }
                if (!decoded) {
                    return resolve(undefined);
                }
                return resolve(decoded as JwtClaims<string, number>);
            })
        });
    }
}