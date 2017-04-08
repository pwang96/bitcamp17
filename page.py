import datetime


class Page:

    def __init__(self, title, author, location=None, date=None, text=None):
        self.title = title
        self.author = author
        self.location = location
        self.date = date
        self.date_of_creation = datetime.datetime.now()
        self.text = text

        