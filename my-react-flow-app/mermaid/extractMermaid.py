import json
import re


fileName = 1
# Open the JSON file for reading
def writeToFile(fileName, text):
    f = open(fileName,"a", encoding="utf-8")
    f.write(text)


with open('new', 'r') as file:
    # Load the JSON data into a Python dictionary
    data = json.load(file)
    # data =  dict(data)

    for key in data['mapping']:
        if( data.get('mapping',{}).get(key,{}).get("message",{}) != None ):
            textList = data.get('mapping',{}).get(key,{}).get("message",{}).get("content",{}).get("parts",{})
            # print(type(textList))

            if( isinstance(textList,list) ):
                brokenMermaid = textList[0].split("```mermaid")
                if( len(brokenMermaid) > 1 ):
                    mermaidGraph = brokenMermaid[1].split("```")[0]
                    filePath = str(fileName) 
                    writeToFile(filePath, mermaidGraph) 
                    fileName += 1

            # print("Hello")



# Print the data
# print(data)

# mapping["0bd9805f-19c0-403b-b288-6665ecaa19db"].message.content.parts
