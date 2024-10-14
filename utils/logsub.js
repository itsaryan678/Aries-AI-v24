const fs = require('fs');
const path = require('path');
const request = require('request');
const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));

const handleLogSubscribe = (api, event) => {
  const imageUrl = "https://i.ibb.co/FbH75d3/lv-0-20240905003755-ezgif-com-video-to-gif-converter.gif";
  const imagePath = path.join(__dirname, 'cache', 'welcomeGif.gif');

  // Create cache folder if not exists
  fs.mkdirSync(path.dirname(imagePath), { recursive: true });

  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`${adminConfig.botName} • [ ${adminConfig.prefix} ]`, event.threadID, api.getCurrentUserID());

    const imageStream = fs.createWriteStream(imagePath);
    request(imageUrl).pipe(imageStream).on('close', () => {
      api.sendMessage(
        {
          body: `✅ 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n━━━━━━━━━━━━━━━━━━\nHello! I'm *${adminConfig.botName}*, your friendly bot assistant. I'm here to help you with commands and make things easier.\n\n🔹 Use *"${adminConfig.prefix}help"* to view all available commands.\n🔹 If you need assistance, feel free to reach out to ${adminConfig.ownerName}.\n\nLet's get started and make this group even better!`,
          attachment: fs.createReadStream(imagePath),
        },
        event.threadID
      );
    });

  } else {
    const { threadID } = event;
    api.getThreadInfo(threadID, (err, threadInfo) => {
      if (err) return console.error(err);
      let { threadName, participantIDs } = threadInfo;
      let addedParticipants = event.logMessageData.addedParticipants;
      var tn = threadName || "this group";

      for (let newParticipant of addedParticipants) {
        let userID = newParticipant.userFbId;
        api.getUserInfo(parseInt(userID), (err, data) => {
          if (err) return console.error(err);
          var obj = Object.keys(data);
          var userName = data[obj].name.replace("@", "");

          if (userID !== api.getCurrentUserID()) {
            const imageStream = fs.createWriteStream(imagePath);
            request(imageUrl).pipe(imageStream).on('close', () => {
              api.sendMessage(
                {
                  body: `🎉 𝗪𝗲𝗹𝗰𝗼𝗺𝗲, ${userName}!\n━━━━━━━━━━━━━━━━━━\nYou’ve just joined *${tn}*, and we’re thrilled to have you here!\n\nYou're member #${participantIDs.length} of this group. We hope you enjoy your time here and contribute to the awesome conversations we’re having.\n\nFeel free to introduce yourself and dive right in!`,
                  attachment: fs.createReadStream(imagePath),
                },
                newParticipant.userFbId,
                event.threadID
              );
            });
          }
        });
      }
    });
  }
};

module.exports = { handleLogSubscribe };
