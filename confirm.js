
exports.getConfirmation=function() {
   let text = "Are you sure you want to delete!";
   if (window.confirm(text) == true) {
     return true
   } else {
     return false
   }
   
 }
