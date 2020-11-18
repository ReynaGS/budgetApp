let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1)
request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoincrement: true });
};

request.onSuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onError = function (event) {
  // log error here
  console.log("error" + event.target.errorCode)
};
//we invoke this function when we need to save a record.
function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // to read and write
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store / existing collection/ table
  const store = transaction.ObjectStore("pending");
  // add record to your store with add method./ add object (record) to collection
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db. just read and write access. 
  const transaction = db.transaction(["pending"], "readwrite")

  // access your pending object store/  Getting everything on database
  const store = transaction.objectStore("pending");

  // get all records from store and set to a variable

  // make dif. calls and waits for every promise to finish. 
  getAll.onSuccess = function () {
    if (getAll.result.length > 0) {
      // call API
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        //after promise is finish, turns response into an json object
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          request.onSuccess = () => {
            const db = request.results;
            const transaction = db.transaction(["pending"], "readwrite");
            // access your pending object store
            const store = transaction.objectStore("pending");
            // clear all items in your store
            store.clear();
          }


        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
