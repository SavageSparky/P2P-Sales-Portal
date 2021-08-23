export var firebaseConfig = {
    apiKey: "AIzaSyACaUG4nwGhbECqL9QwUGiwwdvimCixGEw",
    authDomain: "p2p-sales-portal.firebaseapp.com",
    databaseURL: "https://p2p-sales-portal-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "p2p-sales-portal",
    storageBucket: "p2p-sales-portal.appspot.com",
    messagingSenderId: "34041784827",
    appId: "1:34041784827:web:e47c3d044c05b02249435e",
    measurementId: "G-HVC4G2WFLV",
    databaseURL:"https://p2p-sales-portal-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };

  export async function signIn(auth, provider) {
    let res = await auth.signInWithPopup(provider);
    return res.user;
  }
  
  export async function signOut(auth) {
    let res = await auth.signOut();
    return true;
  }

  export function db_insert(db,path,val){
    db.ref(path).set(val);
}

export async function db_get(db,path){
    let data=await db.ref(path).get();
    return data;
}

export function db_del(db,path){
    db.ref(path).remove();
}