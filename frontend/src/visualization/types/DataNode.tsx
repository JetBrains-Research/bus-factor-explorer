/** @format */

import { BusFactorStatus } from "./BusFactorStatus";
import { User } from "./User";

export interface DataNode {
  busFactorStatus: BusFactorStatus;
  bytes: number;
  children?: Array<DataNode>;
  name: string;
  path: string;
  users?: Array<User>;
}
