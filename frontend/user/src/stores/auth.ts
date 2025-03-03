import { createSignal } from "solid-js";
import { isLoginAPI } from "../api/auth";
import { getUserBySelfAPI } from "../api/user";
import { User } from "../types/user";
import { getToken, removeToken } from "../utils/token";


const [isLogin, setIsLogin] = createSignal(false);
const [profile, setProfile] = createSignal<User | null>(null);

(async () => {
    if (getToken()) {
        try {
            const data = await isLoginAPI()
            setIsLogin(data.data === true)
            const profileData = await getUserBySelfAPI()
            setProfile(profileData.data)
        } catch (e) {
            console.log(e)
        }
    }
})();

const logout = () => {
    setIsLogin(false)
    setProfile(null)
    removeToken()
}

export const useAuthStore = () => {
    return {
        isLogin,
        setIsLogin,
        profile,
        setProfile,
        logout
    }
}