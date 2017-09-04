// need Firebase app before use this.
function FirebaseUtil(){
    var self = this;
	this.copyFbRecord = function(oldRef, newRef) {    
         oldRef.once('value', function(snap)  {
          newRef.set( snap.val(), function(error) {
               if( error && typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
          });
        });
    };
    
    this.moveFbRecord = function(oldRef, newRef) {    
         oldRef.once('value', function(snap)  {
          newRef.set( snap.val(), function(error) {
               if( !error ) { oldRef.remove(); }
               else if( typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
          });
        });
    };
    
    this.removeFbRecord = function(inputDB, ref){
        ref.on('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
                inputDB.ref('daily/' + childSnapshot.key).remove();
            });
        });
    };
}