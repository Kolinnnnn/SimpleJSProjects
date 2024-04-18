class PuzzlePiece {
  constructor(posX, posY, pieceNumber, canvasEl) {
    this.posX = posX;
    this.posY = posY;
    this.pieceNumber = pieceNumber;
    this.canvasEl = canvasEl;
  }
}

//umozliwia upuszczenie elementu 
function allowDrop(e) {
  e.preventDefault();
}

//przeciaganie elementu
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
}

//upuszczenie przeciagnego elementu
function drop(e) {
  e.preventDefault();
  let data = e.dataTransfer.getData("text");
  if (!e.target.firstChild) {
    e.target.appendChild(document.getElementById(data));
    numChildren = document.getElementById("solvingPiecesContainer").getElementsByTagName("*").length;
    if (numChildren >= 32) {
      sendNotification();
    }
  }
}

//Wyswietla powiadomienie jesli jest dostepne lub prosi o pozwolenie dostepu do powiadomien
function notifyUser(message) {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(message);
      displayNotification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification(message);
          displayNotification(message);
        }
      });
    }
  }
}

//wyswietla powiadomienie i usuwa po 5s
function displayNotification(message) {
  let notificationDiv = document.getElementById("notification");
  notificationDiv.innerText = message;
  setTimeout(function() {
    notificationDiv.innerText = '';
  }, 5000);
}

//sprawdza czy poprawnie zostalo ulozone i wyswietla powiadomienie
function sendNotification() {
  let container = document.getElementById("solvingPiecesContainer").children;
  for (let i = 0; i < container.length; i++) {
    if (container[i].id.slice(-1) != container[i].children[0].id.slice(-1)) {
      notifyUser("Incorrectly arranged puzzle!");
      console.log("Incorrectly arranged puzzle!");
      return;
    }
  }
  notifyUser("Correctly arranged puzzle");
  console.log("Correctly arranged puzzle!");
}


let mapObj;

window.onload = function () {
  mapObj = L.map('map').setView([51.505, -0.09], 13);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoib3NrYXJ6dXQiLCJhIjoiY2t5bmU0azBwMmd1ODJ3cDB4c2s4bnI1NyJ9.smj5Jioo-qtBqMPB2OphJQ'
  }).addTo(mapObj);
};

//pobiera aktualna lokalizacje
function getGeolocation() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      mapObj.setView([pos.coords.latitude, pos.coords.longitude], 16);
    },
    () => {
      alert("Failed to retrieve geolocation");
    }
  );
}

//pobiera obraz z widoku mapy, dzieli na kawalki i renderuje czesci mapy
function takeImage() {
  let image = new Image();
  image.src = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${mapObj.getCenter().lng},${mapObj.getCenter().lat},${mapObj.getZoom() - 1},0,0/900x400?logo=false&attribution=false&access_token=pk.eyJ1Ijoib3NrYXJ6dXQiLCJhIjoiY2t5bmU0azBwMmd1ODJ3cDB4c2s4bnI1NyJ9.smj5Jioo-qtBqMPB2OphJQ`;
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = cutImageUp;

  function cutImageUp() {
    pieceWidth = image.width / 4;
    pieceHeight = image.height / 4;
    let imagePieces = [];
    counter = 0;

    for (let y = 0; y < 4; ++y) {
      for (let x = 0; x < 4; ++x) {
        let canvas = document.createElement('canvas');
        canvas.width = pieceWidth;
        canvas.height = pieceHeight;
        let context = canvas.getContext('2d');
        context.drawImage(image, x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight, 0, 0, canvas.width, canvas.height);
        let puzzlePiece = new PuzzlePiece(x, y, counter, canvas);
        imagePieces.push(puzzlePiece);
        counter = counter + 1;
      }
    }

    imagePieces = imagePieces.sort(function () { return 0.5 - Math.random(); });
    let container = document.getElementById("piecesContainer");
    document.getElementById("piecesContainer").innerHTML = '';
    document.getElementById("solvingPiecesContainer").innerHTML = '';

    for (let i = 0; i < imagePieces.length; i++) {
      let temp_img = new Image();
      temp_img.draggable = true;
      temp_img.ondragstart = drag;
      temp_img.src = imagePieces[i].canvasEl.toDataURL();
      temp_img.id = imagePieces[i].pieceNumber;
      container.appendChild(temp_img);
    }

    let solvingPiecesContainer = document.getElementById("solvingPiecesContainer");

    for (let i = 0; i < 16; i++) {
      newDiv = document.createElement("div");
      newDiv.classList.add("pieceContainer");
      newDiv.classList.add("col-3");
      newDiv.id = `piece-container-${i}`;
      newDiv.ondrop = drop;
      newDiv.ondragover = allowDrop;
      solvingPiecesContainer.appendChild(newDiv);
    }
  }
}
