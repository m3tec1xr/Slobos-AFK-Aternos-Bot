"use strict";

const mineflayer = require("mineflayer");
const settings = require("./settings.json");
const express = require("express");
const app = express();

// Render'ın kapanmaması için basit bir web sunucu
app.get("/", (req, res) => res.send("Botlar Aktif!"));
app.listen(process.env.PORT || 5000);

function createBot(name, index) {
    setTimeout(() => {
        const bot = mineflayer.createBot({
            host: settings.server.ip,
            port: settings.server.port,
            username: name,
            version: settings.server.version,
            checkTimeoutInterval: 60000
        });

        console.log(`[${name}] Bağlanmaya çalışıyor...`);

        bot.on('spawn', () => {
            console.log(`[${name}] Sunucuya başarıyla girdi.`);
            
            // Otomatik Kayıt ve Giriş
            if (settings.utils["auto-auth"].enabled) {
                const pass = settings.utils["auto-auth"].password;
                bot.chat(`/register ${pass} ${pass}`);
                setTimeout(() => bot.chat(`/login ${pass}`), 2000);
            }

            // Sürekli Zıplama (Anti-AFK)
            setInterval(() => {
                if (bot.entity) bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }, 10000);

            // Otomatik Mesaj Gönderme
            if (settings.utils["chat-messages"].enabled) {
                setInterval(() => {
                    const msgs = settings.utils["chat-messages"].messages;
                    const msg = msgs[Math.floor(Math.random() * msgs.length)];
                    bot.chat(msg);
                }, settings.utils["chat-messages"]["repeat-delay"] * 1000);
            }
        });

        bot.on('error', (err) => console.log(`[${name}] Hata: ${err.message}`));
        
        bot.on('end', () => {
            console.log(`[${name}] Ayrıldı, 20 saniye sonra tekrar denenecek.`);
            setTimeout(() => createBot(name, 0), 20000);
        });

    }, index * 10000); // Botlar arası 10 saniye bekleme
}

// Tüm botları başlat
settings.botNames.forEach((name, index) => {
    createBot(name, index);
});
