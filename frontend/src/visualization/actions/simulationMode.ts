import { DataNode } from "../types/DataNode";

export function initializeBusFactorDeltaProperties(dataRootNode: DataNode) : DataNode {
  if (dataRootNode == null)
    throw new Error("Empty data file")
  
  dataRootNode.busFactorStatus.nodeStatus = "original";
  dataRootNode.busFactorStatus.delta = 0;

  if (dataRootNode.children) {
    for (let count = 0; count < dataRootNode.children.length; count++){
      dataRootNode.children[count] = initializeBusFactorDeltaProperties(dataRootNode.children[count]);
    }
  }
  
  return dataRootNode;
}
