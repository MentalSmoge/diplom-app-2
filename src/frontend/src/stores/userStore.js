import { makeAutoObservable, runInAction } from "mobx";
import { checkAuth } from "../api/auth";

class UserStore {
    user = null;
    isLoading = false;
    error = null;

    constructor() {
        makeAutoObservable(this);
        this.checkAuth();
    }

    async checkAuth() {
        if (this.user) return;

        this.isLoading = true;
        try {
            const userData = await checkAuth();
            if (userData) {
                // console.log("SDASDA")
                // console.log(userData)
                this.setUser(userData.data);
            }
        } catch (error) {
            this.error = error?.message;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    setUser(user) {
        // console.log("store")
        // console.log(user)
        this.user = user;
        this.error = null;
    }

    clearUser() {
        this.user = null;
    }

    get isAuthenticated() {
        // console.log("store")
        // console.log(!!this.user)
        return !!this.user;
    }
}

export const userStore = new UserStore();