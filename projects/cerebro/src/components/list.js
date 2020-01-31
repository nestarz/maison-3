import { html } from "htm/react";

const client = stitch.Stitch.initializeDefaultAppClient("library-01-mxjco");

const db = client
  .getServiceClient(stitch.RemoteMongoClient.factory, "mongodb-atlas")
  .db("library");

client.auth
  .loginWithCredential(new stitch.AnonymousCredential())
  .then(() =>
    db
      .collection("futurs")
      .find({ owner_id: client.auth.user.id }, { limit: 100 })
      .asArray()
  )
  .then(docs => {
    console.log("Found docs", docs);
    docs
      .map(doc => {
        const li = document.createElement("li");
        li.innerText = doc.number;
        return li;
      })
      .forEach(node => document.querySelector("#list").appendChild(node));
  })
  .catch(err => {
    console.error(err);
  });

export default html`
  OK
`;
