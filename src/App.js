import './App.css';
import 'firebase/auth';
import * as firebase from 'firebase/app';
import firebaseConfig from './firebase.config';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import {useState} from "react";
import {FacebookAuthProvider, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";

firebase.initializeApp(firebaseConfig);

function App() {

    const [newUser, setNewUser] = useState(false);

    const [user, setUser] = useState({
        isSignedIn: false,
        name: '',
        email: '',
        password: '',
        photo: '',
        error: ''
    });
    const provider = new GoogleAuthProvider();
    const fbProvider = new FacebookAuthProvider();
    const auth = getAuth();


    const handleSignIn = () => {
        signInWithPopup(auth,provider)
            .then(res => {
                const {displayName, photoURL, email} = res.user;
                const signedInUser = {
                    isSignedIn: true,
                    name: displayName,
                    email: email,
                    photo: photoURL,
                    error: ''
                }
                setUser(signedInUser);
                console.log(displayName,email,photoURL);
            })
            .catch(err => {
                console.log(err);
                console.log(err.message);
            })
    }

    const handleSignOut = () => {
        signOut(auth).then( res => {
            const signOutUser = {
                isSignedIn: false,
                name: '',
                email: '',
                photo: '',
                error: '',
                success: false
            }
            setUser(signOutUser);
        }).catch((error) => {
            // An error happened.
        });
        console.log("sign out");
    }

    const handleSubmit = (e) => {
        console.log(user.email, user.password);
        if (newUser && user.email && user.password){
            console.log("submit");
            createUserWithEmailAndPassword(auth, user.email, user.password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    // ...
                })
                .then(res=>{
                    const newUserInfo = {...user};
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    updateUserName(user.name);
                })
                .catch((error) => {
                    const newUserInfo = {...user};
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });
        }

        if(!newUser && user.email && user.password){
            console.log("not submit");
            signInWithEmailAndPassword(auth, user.email, user.password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log(userCredential.user);
                })
                .then(res => {
                    const newUserInfo = {...user};
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);

                })
                .catch((error) => {
                    const newUserInfo = {...user};
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });
        }
        e.preventDefault(); // puro page load howa bondho korbe
    }

    const updateUserName = (name) => {
        updateProfile(auth.currentUser, {
            displayName: name
        }).then(() => {
            console.log("username updated successfully");
            // ...
        }).catch((error) => {
            console.log(error);
        });
    }

    const handleBlur = (e) => {
        let isFieldValid = 'true';
        if (e.target.name === 'email'){
            isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
        }
        if (e.target.name === 'password'){
            const isPasswordValid = e.target.value.length > 6;
            const isPasswordHasNumber = /\d{1}/.test(e.target.value);
            isFieldValid = isPasswordHasNumber && isPasswordValid;
        }

        if (isFieldValid){
            const newUserInfo = {...user};
            newUserInfo[e.target.name] = e.target.value;
            setUser(newUserInfo);
        }
    }

    const handleFbSignIn = () => {
        signInWithPopup(auth, fbProvider)
            .then((result) => {
                // The signed-in user info.
                const user = result.user;

                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                const credential = FacebookAuthProvider.credentialFromResult(result);
                const accessToken = credential.accessToken;

                console.log('fb user sign in');
                // ...
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = FacebookAuthProvider.credentialFromError(error);

                // ...
            });
    }
    //console.log(newUser);
    return (
        <div className="App">

            {
                user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button>
                    :
                    <button onClick={handleSignIn}>Sign In</button>
            }
            <br/>
            <button onClick={handleFbSignIn}>Sign in using facebook</button>
            {
                user.isSignedIn && <div>
                    <p>Welcome, {user.name}</p>
                    <p>Your Email: {user.email}</p>
                    <p>Password: {user.password}</p>
                    <img src={user.photo} alt=""/>
                </div>
            }
            <h1>Our own Authentication</h1>

            <input type="checkbox" onChange={() => {setNewUser(!newUser);}} name="newUser" id=""/>
            <label htmlFor="newUser">New User Sign up</label>

            <form onSubmit={handleSubmit} action="">
                {newUser && <input placeholder="Name" name="name" onBlur={handleBlur} type="text" required/>}
                <br/>
                <input placeholder="Email" name="email" onBlur={handleBlur} type="text" required/>
                <br/>
                <input placeholder="Password" name="password" onBlur={handleBlur} type="password" required/>
                <br/>
                <input type="submit" value={newUser ? 'Sign Up' : 'Log In'}/>
            </form>
            <p style={{color:"red"}}>{user.error}</p>
            { user.success && <p style={{color: "green"}}>User {newUser ? 'created' : 'logged in'} successfully</p>}
        </div>
    );
}

export default App;