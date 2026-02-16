import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private firebaseApp: admin.app.App;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

        // Only initialize if we have credentials
        if (!admin.apps.length && privateKey && projectId && clientEmail) {
            this.firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        } else if (admin.apps.length) {
            this.firebaseApp = admin.app();
        }
    }

    getAuth() {
        return this.firebaseApp ? this.firebaseApp.auth() : null;
    }
}
