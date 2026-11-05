// Handle Google Sign-In / Sign-Up
googleSigninBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      console.log("Logged in as:", user.displayName);
    })
    .catch((error) => {
      console.error("Auth error:", error.message);
    });
});




  


