import { firebaseConfig } from "../../../firebase-tictactoe/public/firebase";
import { db_get, signIn } from "./firebase-util";

firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
const signIn_icon=document.querySelectorAll('.profile_icon');
let user_signin_flag=false;
let user_id;


/***************************DB  Driver Functions**************************** */
auth.onAuthStateChanged((user)=>{
    if(user){
        user_signin_flag=true;
        user_id=user.uid;
    }
    else{
        user_signin_flag=false;
    }
})

async function detCheck(){
    const data=await db_get(db,`user/${user_id}`);
    data=data.val();
    if(data){
        return true;
    }
    return false;
}

/***********************************************************************/

signIn_icon.addEventListener("click",()=>{
    if(user_signin_flag){
        if(detCheck()){
            location.href('');
        }
        else{
            
        }
    }
    else{
        signIn(auth,provider);
    }
})