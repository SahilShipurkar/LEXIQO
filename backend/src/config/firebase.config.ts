import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
    constructor(private configService: ConfigService) { }

    onModuleInit() {
        // Check if app is already initialized to avoid duplicate initialization
        if (admin.apps.length === 0) {
            const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
                    clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
                    // Handle private key newlines correctly
                    privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : undefined,
                }),
            });
        }
    }

    getAuth() {
        return admin.auth();
    }
}
