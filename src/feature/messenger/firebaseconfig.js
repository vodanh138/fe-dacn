const firebaseConfig = {
  apiKey: process.env.SECRET_APP_FIREBASE_API_KEY,
  authDomain: process.env.SECRET_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.SECRET_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.SECRET_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.SECRET_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.SECRET_APP_FIREBASE_APP_ID,
  measurementId: process.env.SECRET_APP_FIREBASE_MeasurementId
};
export default firebaseConfig;