from botEventLogger import botInstance

bots = botInstance.find()

for bot in bots:
    print(bot)
