# -*- coding: utf-8 -*-
"""
Parse Excel table to output compact JSON.
Always outputs to terms.json
Usage:
python TermExtractor.py <inputfile.xlsx>
Dependencies:
pandas
"""

# Importing the libraries
import argparse
import json
import sys
import re
import pandas as pd


class Trie():
    """Regex::Trie in Python. Creates a Trie out of a list of words. The trie can be exported to a Regex pattern.
    The corresponding Regex should match much faster than a simple Regex union."""

    def __init__(self):
        self.data = {}

    def add(self, word):
        ref = self.data
        for char in word:
            ref[char] = char in ref and ref[char] or {}
            ref = ref[char]
        ref[''] = 1

    def dump(self):
        return self.data

    def quote(self, char):
        return re.escape(char)

    def _pattern(self, pData):
        data = pData
        if "" in data and len(data.keys()) == 1:
            return None

        alt = []
        cc = []
        q = 0
        for char in sorted(data.keys()):
            if isinstance(data[char], dict):
                try:
                    recurse = self._pattern(data[char])
                    alt.append(self.quote(char) + recurse)
                except:
                    cc.append(self.quote(char))
            else:
                q = 1
        cconly = not len(alt) > 0

        if len(cc) > 0:
            if len(cc) == 1:
                alt.append(cc[0])
            else:
                alt.append('[' + ''.join(cc) + ']')

        if len(alt) == 1:
            result = alt[0]
        else:
            result = "(?:" + "|".join(alt) + ")"

        if q:
            if cconly:
                result += "?"
            else:
                result = "(?:%s)?" % result
        return result

    def pattern(self):
        return self._pattern(self.dump())

def trie_regex_from_words(words):
    trie = Trie()
    for word in words:
        trie.add(word)
    #print(trie.pattern())
    return re.compile(trie.pattern())



# Requires filename to read from
parser = argparse.ArgumentParser()
parser.add_argument("inputfile")
args = parser.parse_args()

# Importing the excel data
try:
    workbook = pd.read_excel(args.inputfile, sheet_name=None, encoding="utf-8")
except OSError:
    sys.exit("ERROR: file could not be read")


terms = dict()
termYenIndex = dict()

for sheet in workbook.values():
    height, width = sheet.shape
    for y in range(0, height):
        for x in range(0, width):

            # Detect cells marked with # or % as the first letter
            cell = sheet.iat[y, x]

            if isinstance(cell, str):
                # Regular term inclusion
                if cell[0] in "#%$":

                    xpos = x + 1
                    default = cell[1:].strip()
                    alts = []
                    yenIndex = 0 # Use default value if no official or identical official

                    # Grab primary replacement if valid
                    if (xpos < width) and (isinstance(sheet.iat[y, xpos], str)):
                        if sheet.iat[y, xpos] != "-":
                            alts.append(sheet.iat[y, xpos].strip())
                            yenIndex = 1

                    while True:
                        # Add optional alts
                        xpos += 1
                        if (xpos < width) and (isinstance(sheet.iat[y, xpos], str)):
                            alts.append(sheet.iat[y, xpos].strip())
                        else:
                            break

                    # Have at least one replacement, otherwise discard
                    # Also keep the default terms as first entry
                    if alts:
                        terms[default]        = [default] + alts
                        termYenIndex[default] = yenIndex

                # Automatically add a capitalized version only if starting with %
                if cell[0] == '%':
                    xpos = x + 1
                    default = cell[1:].strip().capitalize()
                    alts = []
                    yenIndex = 0

                    # Grab primary replacement if valid
                    if (xpos < width) and (isinstance(sheet.iat[y, xpos], str)):
                        if sheet.iat[y, xpos] != "-":
                            alts.append(sheet.iat[y, xpos].strip().capitalize())
                            yenIndex = 1

                    while True:
                        # Add optional alts
                        xpos += 1
                        if (xpos < width) and (isinstance(sheet.iat[y, xpos], str)):
                            alts.append(sheet.iat[y, xpos].strip().capitalize())
                        else:
                            break

                    # Have at least one replacement, otherwise discard
                    # Also keep the default terms as first entry
                    if alts:
                        terms[default]        = [default] + alts
                        termYenIndex[default] = yenIndex

print(f"{len(terms)} terms found with alternatives")
# Export JSON
entries = dict() # Combined dict of terms and yenindex
for key,value in terms.items():
    entries[key] = dict()
    entries[key]["options"] = value
    entries[key]["officialTermIndex"] = termYenIndex[key]

jdata = dict()
jdata["pattern"] = trie_regex_from_words(terms.keys()).pattern
jdata["terms"]   = entries


try:
    with open('terms.json', 'w', encoding="utf-8") as outfile:
        json.dump(jdata, outfile, indent=4, ensure_ascii=False)
except OSError:
    print("ERROR: Writing the file has failed!")
else:
    print("terms.json written successfully")
