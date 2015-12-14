import re

def getPic(content):
    pattern = re.compile(r"\?id=(?P<ID>\d+)")
    result1 = set(pattern.findall(content))
    result = ','.join(list(result1)).encode("utf-8")
    return result