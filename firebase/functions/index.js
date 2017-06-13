var functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
//const admin = require('firebase-admin');
const GeoFire = require('geofire');
//admin.initializeApp(functions.config().firebase);
/*
export.addMessage = functions.https.onRequest((req,res)=>{
    
    const original = req.query.text;
    
    admin.database().ref('/messages').push({texto:original}).then(snapshot =>{
       res.send(200,"MENSAJE AGREGADO KEY: "+snapshot.ref); 
    });
    
    
});

*/
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
/*exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push it into the Realtime Database then send a response
    admin.database().ref('/messages').push({
        original: original
    }).then(snapshot => {
        firebase.database().ref('messages').child(snapshot.ref).then(function (snap) {
            //var messageData = snap.val();
        
        //res.send(200,"Successfully sent message:"+ snapshot.ref.key);
        
            var topic = 'notifications_' + snapshot.ref.key;
            var payload = {
                notification: {
                    title: "TITLE PUSH"
                    , body: "BODY PUSH"
                , }
            };
            admin.messaging().sendToTopic(topic, payload).then(function (response) {
                //console.log("Successfully sent message:", response);
                res.response(200,"Successfully sent message:");
            }).catch(function (error) {
                //console.log("Error sending message:", error);
                res.response(200,"Successfully sent message:");
            });
        });
        // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
       // res.redirect(303, snapshot.ref);
    });
});*/


/*prueba request ddbb
exports.sendMessageNotification = functions.database.ref('/messages/{messageID}').onWrite(event => {
    if (event.data.previous.exists()) {
        return;
    }
    firebase.database().ref('messages').child(event.params.messageID).once('value').then(function (snap) {
        var messageData = snap.val();
        var topic = 'notifications_' + messageData.receiverKey;
        var payload = {
            notification: {
                title: "You got a new Message"
                , body: messageData.content
            , }
        };
        admin.messaging().sendToTopic(topic, payload).then(function (response) {
            console.log("Successfully sent message:", response);
        }).catch(function (error) {
            console.log("Error sending message:", error);
        });
    });
});
*/


exports.sendNewPush = functions.https.onRequest((req, res) => {
    // This registration token comes from the client FCM SDKs.
    var registrationToken = "dWvfiAj4RIE:APA91bHXBwxLsf4m6aVIETqYbwiMk1LJhLJqqPTO4tTGBv-3TAm9cIX8hPgl2CDxTHit8ZCvTbSAH3zn5aXSN7R6kzo1P3_HLBLkc-XVhR1KDqRLfWs7Y4EmoxoXgBRaKV6gS2_fQMeA";

    // See the "Defining the message payload" section below for details
    // on how to define a message payload.
    /*var payload = {
      data: {
        score: "850",
        time: "2:45"
      }
    };*/
    
    let payload = {
            notification: {
                title: 'Firebase Notification',
                body: 'HAAAAAAAAA',
                sound: 'default',
                badge: '1'
            }
        };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().sendToDevice(registrationToken, payload)
      .then(function(response) {
        // See the MessagingDevicesResponse reference documentation for
        // the contents of response.
        console.log("Successfully sent message:", JSON.stringify(response) );
        res.send(200,"Successfully sent message: "+registrationToken); 
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
        res.send(200,"Error sending message: "+registrationToken); 
      });
    
    
});


//exports.sendPush = functions.database.ref('/messages/{messagesId}').onWrite(event => {
//exports.sendPush2 = functions.https.onRequest((req, res) => {
exports.sendPush = functions.database.ref('/tonta').onWrite(event => {
    /*let projectStateChanged = false;
    let projectCreated = false;
    //let projectData = event.data.val();
    if (!event.data.previous.exists()) {
        projectCreated = true;
    }
    if (!projectCreated && event.data.changed()) {
        projectStateChanged = true;
    }
    let msg = 'A project state was changed';
		if (projectCreated) {
			msg = `The following new project was added to the project: HOLA!!!!!`;
		}*/
    let msg = 'A project state was changed';
    
    //console.log("PRUEBA!!!!!!!!!!!");
    
    return loadUsers().then(users => {
        let tokens = [];
        
        for (let user of users) {
            if(user.tokenPush != null){
                tokens.push(user.tokenPush);
            }
            
        }
        let payload = {
            notification: {
                title: 'Firebase Notification',
                body: msg,
                sound: 'default',
                badge: '1'
            }
        };
        //res.send(200,"Successfully sent message: "+tokens); 
        return admin.messaging().sendToDevice(tokens, payload);
        //admin.messaging().sendToDevice(tokens, payload);
        //res.send(200,"Successfully sent message: "+tokens); 
    });
    
    
});
function loadUsers() {
    let dbRef = admin.database().ref('/profiles');
    let defer = new Promise((resolve, reject) => {
        dbRef.once('value', (snap) => {
            let data = snap.val();
            //res.send(200,"Successfully sent message: "+data);
            //console.log("-------->>>>>>>>>>>>>>>>>> "+data);
            let users = [];
            for (var property in data) {
                users.push(data[property]);
            }
            resolve(users);
        }, (err) => {
            reject(err);
        });
    });
    return defer;
}






//Funcion GEO + PUSH
exports.GEOpush = functions.database.ref('/messages/{messageID}').onWrite(event => {
    
     if (event.data.previous.exists()) {
        return;
    }
    admin.database().ref('messages').child(event.params.messageID).once('value').then(function (snap) {
        var geoFire = new GeoFire(admin.database().ref('geolocs'));
        var messageData = snap.val();
        var body = messageData.body;
        var title = messageData.title;
        var uidsender = messageData.uidsender;
        var radius = messageData.radius;
        //var locationSender=null;
        var locationSender=[];
        var arTokens=[];
        
        geoFire.get(uidsender).then(function(location) {
          if (location === null) {
            log( selectedFishKey + " is not in GeoFire");
          }
          else {
            log(selectedFishKey + " is at location [" + location + "]");
              //locationSender = location;
              locationSender.push(location);
          }
        });
        
        //DEVUELVE LISTA DE KEYS EN UN CENTRO LAT LON Y RADIUS EN KILOMETROS. EL ON SE EJECUTA LA CANTIDAD DE VECES QUE KEYS ENTREN.
        // NO ES NECESARIO UN FOR
        var geoQuery;
        geoQuery = geoFire.query({
            center: locationSender,
            radius: radius
          });

          geoQuery.on("key_entered", function(key, location, distance) {
            //log(key + " is located at [" + location + "] which is within the query (" + distance.toFixed(2) + " km from center)");
              var refUserTokenPush=admin.database().ref('profiles/' + key + '/tokenPush');
              refUserTokenPush.once('value').then(function(snapshot) {
                var tk = snapshot.val();
                  // ...
                  arTokens.push(tk);
                });
          });
        
        //AQUI USAMOS EL ARRAY DE TOKENS PARA ENVIAR EL PAYLOAD Y MENSAJE
        let payload = {
            notification: {
                title: title,
                body: body,
                sound: 'default',
                badge: '1'
            }
        };
        return admin.messaging().sendToDevice(arTokens, payload);
        
        
        
    });
    
    
});