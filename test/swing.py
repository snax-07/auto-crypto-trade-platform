import asyncio

class swing:
    def __init__(self , config):
        self.config = config
    
    def runBot(self):
        while True:
            print(f'bot for {self.config} in swing')