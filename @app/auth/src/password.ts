import * as crypto from 'crypto';

const HASH_ITERATIONS = 200000;
const HASH_KEY_LENGTH = 128;
const HASH_DIGEST = 'sha512';

const GENERATED_SALT_LENGTH = 32;

export namespace Password {
    export async function hashPassword(password: string, salt: string) {
        return new Promise<string>((resolve, reject) => {
            // Password-Based Key Derivation Function 2
            // https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options
            return crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST, (err, derivedKey) => {
                if (err) throw err;
                return resolve(derivedKey.toString('hex'));
            });
        });
    }

    export function generateSalt() {
        return crypto.randomBytes(GENERATED_SALT_LENGTH).toString('hex');
    }
}