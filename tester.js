const https = require("http");

let contador = 0;

for (let i = 0; i < 10; i++) {
  https
    .get("http://localhost:8000/api/users", resp => {
      let data = "";
      resp.on("data", chunk => {
        data += chunk;
      });
      resp.on("end", () => {
        console.log(JSON.parse(data));
      });
    })
    .on("error", err => {
      console.log("ERROR " + err);
    });
}
