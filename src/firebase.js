// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  signInWithCustomToken,
} from "firebase/auth";
import { store } from "./store/store";
import { authSlice } from "./store/authSlice";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// CRUD = Create, Read, Update, Delete
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

auth.onAuthStateChanged((user) => {
  if (user) {
    store.dispatch(
      authSlice.actions.setData({
        id: user.uid,
        email: user.email,
        fullName: user.displayName,
        token: user.accessToken,
      })
    );
  } else {
    store.dispatch(authSlice.actions.logout());
  }
});

export const signUp = async (email, password, fullName) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  store.dispatch(
    authSlice.actions.setData({
      id: user.uid,
      email: user.email,
      fullName: user.displayName,
      token: user.accessToken,
    })
  );
  return user;
};

export const logout = async () => {
  await signOut(auth);
  store.dispatch(authSlice.actions.logout());
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  console.log(user);
  store.dispatch(
    authSlice.actions.setData({
      id: user.uid,
      email: user.email,
      fullName: user.displayName,
      token: user.accessToken,
    })
  );
  return user;
};

export const getQuotes = async () => {
  const quotesCollection = collection(db, "quotes");
  const quoteResults = await getDocs(quotesCollection);
  const quoteList = quoteResults.docs.map((doc) => {
    const data = doc.data();
    const id = doc.id;
    return { ...data, id: id };
  });
  return quoteList;
};

export const getQuoteById = async (id) => {
  const docRef = doc(db, "quotes", id);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return { ...data, id: id };
};

export const likeQuote = async (id, likes) => {
  const docRef = doc(db, "quotes", id);
  return await updateDoc(docRef, { likes: likes });
};

export const updateQuoteData = async (id, data) => {
  const docRef = doc(db, "quotes", id);
  return await updateDoc(docRef, data);
};

export const deleteQuote = async (id) => {
  const docRef = doc(db, "quotes", id);
  return await deleteDoc(docRef);
};

export const addQuote = async (data) => {
  const result = await addDoc(collection(db, "quotes"), data);
  return result;
};

/*
Dozvoli dodavanje, update i brisanje samo prijavljenim userima

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read;
      allow write, update, delete: if request.auth != null;
    }
  }
}
*/

/*
Dozvoli pisanje, update i brisanje samo svojih citata prijavljenim userima

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read;
      allow write, update, delete: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
*/
