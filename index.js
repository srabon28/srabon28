const login = require("facebook-chat-api");
const fs = require("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Messenger Bot is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function startBot() {
  try {
    if (fs.existsSync("./appstate.json")) {
      const appStateData = fs.readFileSync("./appstate.json", "utf8");
      if (appStateData && appStateData.trim() !== "" && appStateData !== "[]") {
        const appState = JSON.parse(appStateData);
        login({appState: appState}, (err, api) => {
          if(err) {
            console.error("Login error:", err);
            return;
          }

          console.log("Logged in successfully!");
          api.setOptions({ listenEvents: true });

          api.listenMqtt((err, message) => {
            if(err) {
              console.error("Listen error:", err);
              return;
            }

            if (message.type === "message") {
              console.log(`Received message: ${message.body}`);
              api.sendMessage(`Bot response: I received your message: "${message.body}"`, message.threadID);
            }
          });
        });
      } else {
        console.log("appstate.json is empty or invalid. Please provide your Facebook session state.");
      }
    } else {
      console.log("appstate.json not found.");
    }
  } catch (e) {
    console.error("Error starting bot:", e);
  }
}

startBot();
