import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import * as admin from 'firebase-admin';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	private readonly logger = new Logger(JwtAuthGuard.name);

	constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {
		// Initialize Firebase admin if not already
		try {
			if (!admin.apps.length) {
				if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
					const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
					admin.initializeApp({
						credential: admin.credential.cert({
							projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
							clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
							privateKey,
						} as any),
					});
					this.logger.log('Initialized Firebase Admin from env credentials');
				} else {
					// fall back to application default credentials
					try {
						admin.initializeApp();
						this.logger.log('Initialized Firebase Admin with default credentials');
					} catch (e) {
						this.logger.warn('Firebase Admin not initialized (no credentials found)');
					}
				}
			}
		} catch (e) {
			this.logger.warn('Firebase admin init error: ' + e?.message);
		}
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const auth = req.headers?.authorization || req.headers?.Authorization;
		if (!auth) throw new UnauthorizedException('Missing Authorization header');

		const parts = String(auth).split(' ');
		if (parts.length !== 2) throw new UnauthorizedException('Invalid Authorization header');
		const token = parts[1];

		// Try verifying as internal JWT first
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_SECRET,
			});
			req.user = payload;
			return true;
		} catch (err) {
			// not an internal JWT — try Firebase ID token
		}

		// Try Firebase ID token verification
		try {
			if (!admin.apps.length) throw new Error('Firebase admin not initialized');
			const decoded = await admin.auth().verifyIdToken(token);
			const email = decoded.email;
			if (!email) throw new UnauthorizedException('Firebase token missing email claim');

			// find or create local user record
			const user = await this.usersService.findOrCreateFromFirebase(email, decoded.name || '', '');
			req.user = { id: user.id, email: user.email };
			return true;
		} catch (e) {
			this.logger.warn('Firebase verify failed: ' + e?.message);
			throw new UnauthorizedException('Invalid token');
		}
	}
}

