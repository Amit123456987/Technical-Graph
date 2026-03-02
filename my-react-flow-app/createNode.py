import re
import copy
import os

def write_dict_to_file(nodes, edges ,file_path):
    try:
        with open(file_path, "w") as file:
            file.write("export let initialNodes = " + str(nodes) + "\n")
            file.write("export let initialEdges = " + str(edges) + "\n")
        
        print(f"Dictionary successfully written to {file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

def list_files_in_folder(folder_path):
    try:
        # List all files and directories in the specified folder
        items = os.listdir(folder_path)

        # Filter out directories, keeping only files
        files = [f for f in items if os.path.isfile(os.path.join(folder_path, f))]

        return files
    except FileNotFoundError:
        print(f"The folder {folder_path} does not exist.")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []


edgeType = 'smoothstep'
position = { "x": 0, "y": 0 }
graphNode = {
    'id': '1',
    'data': { 'label': 'input' },
    'position' : position,
}
graphEdge = { "id": '', "source": '1', "target": '2' }
nodeList= []
edgeList= []

folder_name = "C:/Users/amitm/Documents/flowchart vite/my-react-flow-app/mermaid/"

for file in list_files_in_folder(folder_name):
    f = open(folder_name+file)
    lineList = f.read()

    for line in lineList.split("\n"):
        nodes = line.split("-->")
        count = 0
        graphEdge["id"] = ""
        
        for node in nodes:
            node = node.strip()
            openBracket = node.find("[")
            closeBracket = node.rfind("]")


            if( openBracket > -1 ):
                beforeBracketString = node[0:openBracket]
                betweenBracketString = node[openBracket+1: closeBracket]
                if( count == 0 ):
                    graphEdge['source'] = file+beforeBracketString 
                elif( count == 1 ):
                    graphEdge['target'] = file+beforeBracketString 
                graphNode['id'] = file + beforeBracketString  
                graphNode['data']['label'] = betweenBracketString
                graphEdge['id'] += file + beforeBracketString        
                graphNode['sourcePosition'] = 'right'
                graphNode['targetPosition'] = 'left' 

                # print(beforeBracketString, betweenBracketString)
            else:
                graphEdge['source'] = file + node
                graphEdge['id'] += file + node
            count += 1
            nodeList.append(copy.deepcopy(graphNode))
        edgeList.append(copy.deepcopy(graphEdge))

filePath = "C:/Users/amitm/Documents/flowchart vite/my-react-flow-app/src/initialElements.jsx"
write_dict_to_file(nodeList, edgeList,filePath )
print(nodeList)
print("\n",edgeList)