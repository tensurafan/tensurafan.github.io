# -*- coding: utf-8 -*-
"""
Parse csv table to output compact JSON.
Always outputs to terms.json

Usage:
python TermExtractor.py <inputfile.csv>

Dependencies:
pandas
"""

# Importing the libraries
import argparse
import json
import sys
from collections import namedtuple
import pandas as pd

# Requires filename to read from
parser = argparse.ArgumentParser()
parser.add_argument("inputfile")
args = parser.parse_args()

# Importing the csv data
try:
    data = pd.read_csv(args.inputfile, encoding="utf-8")
except:
    sys.exit("ERROR: file could not be read")

# Create list of named tuples for matching terms
height, width = data.shape
termlist = []
Term = namedtuple("Term", "default yen alts")

for y in range(0, height):
    for x in range(0, width):

        # Detect cells marked with # or % as the first letter
        cell = data.iat[y, x]

        if isinstance(cell, str):
            # Regular term inclusion
            if cell[0] == '#' or cell[0] == '%': 

                xpos = x + 1
                default = cell[1:].strip()

                # Grab primary replacement if valid
                if (xpos < width) and (isinstance(data.iat[y, xpos], str)):
                    yen = data.iat[y, xpos].strip()
                else:
                    yen = ""

                alts = []

                while True:
                    # Add optional alts
                    xpos += 1
                    if (xpos < width) and (isinstance(data.iat[y, xpos], str)):
                        alts.append(data.iat[y, xpos].strip())
                    else:
                        break
                
                # Have at least one replacement, otherwise discard
                if yen or alts:
                    termlist.append(Term(default=default, yen=yen, alts=alts))
            
            # Automatically add a capitalized version only if starting with %
            if cell[0] == '%':
                xpos = x + 1
                default = cell[1:].strip().capitalize()
                
                # Grab primary replacement if valid
                if (xpos < width) and (isinstance(data.iat[y, xpos], str)):
                    yen = data.iat[y, xpos].strip().capitalize()
                else:
                    yen = ""
                    
                alts = []
                
                while True:
                    # Add optional alts
                    xpos += 1
                    if (xpos < width) and (isinstance(data.iat[y, xpos], str)):
                        alts.append(data.iat[y, xpos].strip().capitalize())
                    else:
                        break
                
                # Have at least one replacement, otherwise discard
                if yen or alts:
                    termlist.append(Term(default=default, yen=yen, alts=alts))

# Export JSON
jset = {}

# Add every term in form: "Default name": ["Default name", "yen name", "alts"]
for t in termlist:
	# Add the Default name, then yen name. Repeat Default if no yen name is given
    jset[t.default] = [t.default]
    jset[t.default].append(t.yen if t.yen else t.default)
    for a in t.alts:
        jset[t.default].append(a)

try:
    with open('terms.json', 'w', encoding="utf-8") as outfile:
        json.dump(jset, outfile, indent=4, ensure_ascii=False)
except:
    print("ERROR: Writing the file has failed!")
else:
    print("terms.json written successfully")
