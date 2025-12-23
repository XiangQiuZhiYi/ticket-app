
import { addUser, findOneUser } from "@/api/user";

export const LOCAL_USER_KEY = "userInfo";

export async function getLocalUser() {
  try {
    return uni.getStorageSync(LOCAL_USER_KEY) || null;
  } catch (e) {
    return null;
  }
}

export async function clearLocalUser() {
  try {
    uni.removeStorageSync(LOCAL_USER_KEY);
  } catch (e) {}
}

export async function ensureLogin() {
  const userInfo = uni.getStorageSync("userInfo");
  if (userInfo) {
    return userInfo;
  } else {
    const res = await new Promise((resolve, reject) => {
      uni.getUserInfo({
        lang: "zh_CN",
        success: (r) => resolve(r.userInfo),
        fail: (err) => reject(err),
      });
    });
    const user = await addUser(res);
    const userInfo = await findOneUser({ _id: user._id });
    uni.setStorageSync("userInfo", userInfo);
    return userInfo;
  }
}

export default {
  getLocalUser,
  ensureLogin,
  clearLocalUser,
};
