var pathArray = ["acc2dwat", "acc2elec", "acc2sani", "ere", "risk", "geonames"]; //names of categorical factors and json files
var acc2dwat, acc2elec, acc2sani, ere, risk, geonames;


var res = [];

for (var i = 0; i < pathArray.length; i++) {
    function loadJSON(callback) {   //https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
        var xobj = new XMLHttpRequest();

        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'data/'+pathArray[i]+'.json', false); // loads file based on name from array
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
     };

    loadJSON(function(response) {
        res.push(JSON.parse(response));
        // console.log(JSON.parse(response));
        // okay[i] = JSON.parse(response);
        //    if okay[i] ==
        // window[pathArray[i]] = JSON.parse(response); //makes it readible
        // console.log(pathArray[i]);
        // console.log(pathArray[i]);
        // console.log(actual_JSON[0].country); //checks for country
    });

}

acc2dwat = res[0];
console.log(acc2dwat.length);
acc2elec = res[1];
console.log(acc2elec.length);
acc2sani = res[2];
console.log(acc2sani.length);
ere = res[3];
console.log(ere.length);
risk = res[4];
console.log(risk.length);
geonames = res[5];
console.log(geonames.length);




