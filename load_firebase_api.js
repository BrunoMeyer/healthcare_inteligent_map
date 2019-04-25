// Initialize Firebase
var config = {
  apiKey: "YOUR_KEAY",
  authDomain: "yourdomain.firebaseapp.com",
  databaseURL: "https://yoururl.firebaseio.com",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket.appspot.com",
  messagingSenderId: "messaging_sender_id"
};

firebase.initializeApp(config);

function writeUserData(json) {
firebase.database().ref('cache/').set({
  data:JSON.stringify(localStorage)
});

}
//~ firebase.database().ref('cache/').set({
//~ data:JSON.stringify(localStorage)
//~ });