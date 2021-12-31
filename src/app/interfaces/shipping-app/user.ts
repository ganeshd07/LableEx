import { AccountType } from 'src/app/types/enum/account-type.enum';

export interface IUser {
    userId: string;
    userProfile?: any;
    accountType: AccountType;
    accountProfile: any;
    isUserLoggedIn: boolean;
    lastLogin: Date;
    uidValue?: string;
}
