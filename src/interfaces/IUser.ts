export interface IUserToken {
    accessToken: string;
    expiresIn: string;
}

export interface IUser {
    name: string;
    email: string;
    isAdmin: boolean;
    token: IUserToken;
    permissions: Array<string>;
    firstLogin: boolean;
    lastLoginAt: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}