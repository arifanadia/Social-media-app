import { INewUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases } from "./config";


interface AppwriteError extends Error {
    code?: number; // Optional because not all errors have a code
}



export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,
        )

        if (!newAccount) throw Error

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDb({
            accountId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            username: user.username,
            imageUrl: avatarUrl
        })
        return newUser
    } catch (error) {
        console.log(error);
        return error

    }
}

export async function saveUserToDb(user: {
    accountId: string,
    email: string,
    name: string,
    username?: string,
    imageUrl: URL,

}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        )
        return newUser;
    } catch (error) {
        console.log(error);

    }
}

export async function signInAccount(user: { email: string; password: string; }) {
    try {
        // Check if there is already an active session
        const activeSession = await account.getSession('current');

        if (activeSession) {
            console.log('User is already logged in.');
            return activeSession; // Return the existing session
        }
    } catch (error : unknown) {
        const appwriteError = error as AppwriteError; 
        if (appwriteError.code === 404) { // Error code 404 means no active session
            try {
                const session = await account.createEmailPasswordSession(user.email, user.password);
                return session;
            } catch (createSessionError) {
                console.log('Error creating session:', createSessionError);
            }
        } else {
            console.log('Error checking session:', error);
        }
    }
}


export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentUser) throw Error

        return currentUser.documents[0]
        
    } catch (error) {
        console.log(error);
        
    }
}