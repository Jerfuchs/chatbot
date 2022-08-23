from abc import ABCMeta, abstractmethod
import re

class EmailValidatior:
    __metaclass__ = ABCMeta
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
 
    @classmethod
    def version(self): 
        return "1.0"

    @classmethod
    def validate_email(self, email): 
        if(re.fullmatch(EmailValidatior.regex, email)):
            return True
        else:
            return False