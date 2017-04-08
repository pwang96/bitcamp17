from sparkpost import SparkPost
from settings import SPARKPOST_API_KEY
import datetime


class Scrapbook:

    def __init__(self, title, page, private=False, password=None):
        self.title = title
        self.length = 1
        self.date_of_creation = datetime.datetime.now()
        self.last_updated = None
        self.pages = [page]
        self.private = private
        self.password = password

    def add_page(self, page):
        """
        Adds a page into the scrapbook given a page.
        Maybe sort by date of creation or something?
        :param page: Page object
        :return: length of Scrapbook
        """
        self.pages.append(page)
        self.length += 1

