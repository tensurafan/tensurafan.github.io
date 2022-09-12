#!/bin/python
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
from collections import OrderedDict


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
    workbook = pd.read_excel(args.inputfile, header=None, sheet_name=None)
except OSError:
    sys.exit("ERROR: file could not be read")


terms = dict()
termYenIndex = dict()
termTTSIndex = dict()
termGroups = OrderedDict() # Contains a list of terms in a given category
termGroupsMetadata = list() # Contains tuples of group names with their x value
termGroupsLastY = -1 # Metadata list is deleted on every new y val

for sheet in workbook.values():

    # Delete stale metadata
    termGroupsLastY = -1

    height, width = sheet.shape
    for y in range(0, height):
        for x in range(0, width):

            # Detect cells marked with #, $, !, ~, *, § as the first letter
            cell = sheet.iat[y, x]

            if isinstance(cell, str):
                # Regular term inclusion
                if cell[0] in "#$!~":

                    xpos = x + 1
                    default = cell[1:].strip()
                    alts = []
                    yenIndex = 0 # Use default value if no official or identical official
                    ttsIndex = 0 # Use default value unless an optimized one is available

                    # Grab primary replacement if valid
                    if (xpos < width) and (isinstance(sheet.iat[y, xpos], str)):
                        if sheet.iat[y, xpos] != "-":
                            alts.append(sheet.iat[y, xpos].strip())
                            yenIndex = 1

                    while True:
                        # Add optional alts
                        xpos += 1
                        if (xpos < width) and (isinstance(sheet.iat[y, xpos], str)):
                            # Multiple terms may be shared in one cell
                            alt_terms = sheet.iat[y, xpos].strip().split("&")
                            for alt_term in alt_terms:
                                if "TTS:" in alt_term:
                                    alt_term = alt_term[4:]
                                    # Count number of alternatives already present and add 1 for the uncounted original term
                                    ttsIndex = len(alts) + 1
                                    if not alt_term:
                                        print(f"WARNING: A TTS term was left empty in {sheet.iat[y, xpos].strip()}")
                                alts.append(alt_term)
                        else:
                            break

                    # Have at least one replacement, otherwise discard
                    # Also keep the default terms as first entry
                    if alts:
                        terms[default]        = [default] + alts
                        termYenIndex[default] = yenIndex
                        termTTSIndex[default] = ttsIndex
                        # Add to the group that is to its left
                        for group in reversed(termGroupsMetadata):
                            if x >= group[1]:
                                termGroups[group[0]].append(default)
                                break
                        else:
                            print(f"{default} is homeless :(")


                # Include reference to term in this group
                elif cell[0] == "*":
                    default = cell[1:].strip()
                    for group in reversed(termGroupsMetadata):
                        if x >= group[1]:
                            termGroups[group[0]].append(default)
                            break
                    else:
                        print(f"{default} is homeless :(")

                # Test for category markers
                elif cell[0] == "§":

                    group = cell[1:].strip()
                    #print(f"{group} {x} {y}")
                    termGroups[group] = []
                    if y > termGroupsLastY:
                        #print(f"Metadata was: {termGroupsMetadata}")
                        # Clear metadata list
                        termGroupsMetadata.clear()
                        termGroupsLastY = y

                    termGroupsMetadata.append((group, x))


print(f"{len(terms)} terms found with alternatives")
# Export JSON
entries = dict() # Combined dict of terms and yenindex
for key,value in terms.items():
    entries[key] = dict()
    entries[key]["options"] = value
    entries[key]["officialTermIndex"] = termYenIndex[key]
    entries[key]["textToSpeechIndex"] = termTTSIndex[key]
    entries[key]["caseSensitive"] = key[0].isupper()

for groupname,grouplist in list(termGroups.items()):
    if not grouplist:
        print(f"INFO: {groupname} is empty, removing group...")
        del termGroups[groupname]
        continue

    # Validate existance of referenced terms due to the * inclusion
    for ref in list(grouplist):
        if ref not in terms.keys():
            print(f"INFO: {ref} referenced in group {groupname}, but not included in terms. Removing from group...")
            grouplist.remove(ref)


jdata = dict()
jdata["pattern"] = trie_regex_from_words(terms.keys()).pattern
jdata["terms"]   = entries
jdata["groups"]  = termGroups


try:
    with open('terms.json', 'w', encoding="utf-8") as outfile:
        json.dump(jdata, outfile, indent=4, ensure_ascii=False)
except OSError:
    print("ERROR: Writing the file has failed!")
else:
    print("terms.json written successfully")
