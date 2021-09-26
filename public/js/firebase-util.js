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

export function pushKey(db, reference, key){
  return db.ref(reference).child(key).push().key;
}

export function db_update(db,path,val){
  db.ref(path).update(val);
}

export function regex_rem(txt){
    txt=txt.replaceAll('<','');
    txt=txt.replaceAll('>','');
    txt=slashRem(txt);
    return txt
}

export function slashRem(txt){
  txt=txt.replaceAll('/','');
  return txt;
}

export function date_splitter(date) {
  date = date.split("-");
  console.log(date);
  let txt;
  switch (+date[1]) {
    case 1:
      txt = `${date[2]} Jan ${date[0]}`;
      break;
    case 2:
      txt = `${date[2]} Feb ${date[0]}`;
      break;
    case 3:
      txt = `${date[2]} Mar ${date[0]}`;
      break;
    case 4:
      txt = `${date[2]} Apr ${date[0]}`;
      break;
    case 5:
      txt = `${date[2]} May ${date[0]}`;
      break;
    case 6:
      txt = `${date[2]} Jun ${date[0]}`;
      break;
    case 7:
      txt = `${date[2]} Jul ${date[0]}`;
      break;
    case 8:
      txt = `${date[2]} Aug ${date[0]}`;
      break;
    case 9:
      txt = `${date[2]} Sept ${date[0]}`;
      break;
    case 10:
      txt = `${date[2]} Oct ${date[0]}`;
      break;
    case 11:
      txt = `${date[2]} Nov ${date[0]}`;
      break;
    case 12:
      txt = `${date[2]} Dec ${date[0]}`;
      break;
  }
  return txt;
}
