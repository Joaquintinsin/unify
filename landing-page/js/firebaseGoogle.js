import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {GoogleAuthProvider, getAuth} from "firebase/auth";
import firebase from 'firebase/app';

//const provider = new GoogleAuthProvider();

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: ""
    };

    //Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    //const analytics = getAnalytics(app);
    const auth = firebase.auth(); // Para utilizar Firebase Authentication

    const db = firebase.firestore();

    // Esperar a que el documento esté completamente cargado
    document.addEventListener("DOMContentLoaded", function() {
        // Obtener el botón de Google por su id
        const buttonGoogle = document.getElementById("buttonGoogle");

        // Agregar un evento de clic al botón de Google
        buttonGoogle.addEventListener("click", function() {
            // Aquí puedes ejecutar la función para iniciar sesión con Google
            firebaseGoogle.signInWithGoogle(); // Asegúrate de que firebaseGoogle.signInWithGoogle() esté definido y funcione correctamente
        });
    });

    // Función para iniciar sesión con Google
    function signInWithGoogle() {
        // Crea una instancia del proveedor de Google
        const provider = new firebase.auth.GoogleAuthProvider();

        // Inicia sesión con el proveedor de Google
        auth.signInWithPopup(provider)
            .then((result) => {
                //const credential = GoogleAuthProvider.credentialFromResult(result);
                //const token = credential.accessToken;
                // Acceso exitoso, puedes acceder a la información del usuario aquí
                const user = result.user;
                alert(result.user.displayName)
                console.log(user);
                // Redirige o realiza otras acciones según tu aplicación
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.error(errorMessage);
        });
    }