import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDls2iunNPtXRMa1xM4NDI2FxEQTTAbA9g",
  authDomain: "nimbus-5eb06.firebaseapp.com",
  projectId: "nimbus-5eb06",
  storageBucket: "nimbus-5eb06.appspot.com",
  messagingSenderId: "875034701541",
  appId: "1:875034701541:web:982eaceea84149f85aee0c",
  measurementId: "G-Z5PM931WV2"
};

const app = initializeApp(firebaseConfig);
export const googleAuth = getAuth(app);

export default app;
