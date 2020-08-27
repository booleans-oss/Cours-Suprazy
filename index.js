
Save New Duplicate & Edit Just Text Twitter
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
let dejavu = new Map();
let time = new Map();


bot.on("message", message => {
    if (message.channel.type === "dm") {
        bot.emit("messageprivee", message)
    }
})

bot.on("messageprivee", message => {

    if (time.has(message.author.id)) return message.channel.send("Tu as fermé un ticket trop récemment.");
    if (!dejavu.has(message.author.id)) {

        let guild = client.guilds.cache.get("731965139653230592");
        let channel = client.channels.cache.get("731965139653230595") // message.guild.channels.cache.find(channel => channel.name === "LE NOM DU CHANNEL")
        dejavu.set(message.author.id, message.channel.id)
        message.channel.send("Votre ticket a bien été pris en compte.")
        let messagetostaff = await channel.send(message.content);
        await messagetostaff.react("❌");
        await messagetostaff.react("🟢");
        let role = guild.roles.cache.get("731965290820272169") // message.guild.roles.cache.find(role => role.name === "NOM DU ROLE");
        try {
            let filtre = (reaction, user) => ["❌", "🟢"].includes(reaction.emoji.name) && !user.bot;
            let reactionCollection = await messagetostaff.awaitReactions(filtre, {
                max: 1,
                time: 86400000
            });
            let choix = reactionCollection.get("❌") || reactionCollection.get("🟢");
            switch (choix.emoji.name) {
                case "❌":
                    message.author.send("Votre ticket a été refusé.");
                    dejavu.delete(message.author.id)
                    time.set(message.author.id, message.channel);
                    setTimeout(() => {
                        time.delete(message.author.id);
                    }, 100000)
                    break;
                case "🟢":
                    message.author.send("Votre ticket a été accepté.");
                    collectors(channel, message);
            }
        } catch (err) {
            console.log(err)
            message.author.send("Votre requête n'a pas été convaincante.");
            dejavu.delete(message.author.id);
            time.add(message.author.id, message.channel);
            setTimeout(() => {
                time.delete(message.author.id);
            }, 10000);
        }
    }

    function collectors(channel, message) {
        let filter = m => m.channel.id === channel.id && !m.author.bot;
        let channelCollector = channel.createMessageCollector(filter);
        let filter1 = m => m.channel.id === message.channel.id && m.author.id === message.author.id;
        let DMCollector = message.channel.createMessageCollector(filter1);
        return new Promise((resolve, reject) => {
            DMCollector.on("collect", m => {
                if (m.attachments.size !== 0) {
                    getImages(m.attachments, channel)
                }
                channel.send(m.content);
            })
            channelCollector.on("collect", m => {
                if (m.content === "!fermer") {
                    message.channel.send("Votre ticket a été bien fermé.")
                    dejavu.delete(message.author.id)
                    time.set(message.author.id, message.channel)
                    setTimeout(() => {
                        time.delete(message.author.id);
                    }, 10000);
                    DMCollector.stop();
                    channelCollector.stop();
                } else {
                    if (m.attachments.size !== 0) {
                        getImages(m.attachments, message)
                    }
                    message.channel.send(m.content);
                }

            })

        })
    }

    function getImages(fichiers, channel) {
        const validation = /^.*(gif|png|jpg|jpeg)$/g;
        let images = fichiers.array().filter(image => validation.test(image.url)).map(image => image.url);
        console.log(images)
        channel.send({
            files: images
        });
    }
})
