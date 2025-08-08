
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import 'firebase/compat/auth'; // Se añade el servicio de autenticación

// Configuración real del proyecto de Firebase del usuario.
const firebaseConfig = {
  apiKey: "AIzaSyC-3EtommEekqajyq_3C-qj1xen08QAzwk",
  authDomain: "inventario-app-5.firebaseapp.com",
  projectId: "inventario-app-5",
  storageBucket: "inventario-app-5.appspot.com",
  messagingSenderId: "801620157322",
  appId: "1:801620157322:web:c02d6e24ad9094485a5e73",
  measurementId: "G-FL86B2RHW9"
};


// Inicializa Firebase, evitando reinicializaciones en entornos de desarrollo con HMR
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta instancias de los servicios de Firebase
export const db = firebase.firestore();
export const functions = firebase.functions();
export const auth = firebase.auth(); // Se exporta el servicio de autenticación
